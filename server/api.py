"""
API
"""
from datetime import date, timedelta
from functools import wraps
import json
import logging.config
from random import randint, sample
from typing import NamedTuple

from server.dbaccess import (
    Word, Activity, Flag
)
from server.util import (
    open_file,
    db_operation,
    convert_to_activity_type_for_display,
    convert_to_date_for_display
)


DB_FLAG = Flag()

TODAY = date.today()

logging.config.fileConfig('./setting/logging.conf')
LOGGER = logging.getLogger()


class BadRequest(NamedTuple):
    """ BadRequestレスポンス """
    status: str = '400 Bad Request'
    content_type: str = 'application/json'
    body: dict = json.dumps({})


class NotFound(NamedTuple):
    """ NotFoundレスポンス """
    status: str = '404 Not Found'
    content_type: str = 'text/html'
    body: dict = json.dumps({})


class InternalServerError(NamedTuple):
    """ InternalServerErrorレスポンス """
    status: str = '500 Internal Server Error'
    content_type: str = 'application/json'
    body: dict = json.dumps({})


class ResponseBase:
    """ レスポンス基底 """
    def __init__(self, content_type, body):
        """コンストラクタ

        @param content_type コンテンツタイプ
        @param body ボディ
        """
        self._status = '200 OK'
        self._content_type = content_type
        self._body = body

    @property
    def status(self):
        """ステータスコードを返却

        @return ステータスコード
        """
        return self._status

    @property
    def content_type(self):
        """コンテンツタイプを返却

        @return コンテンツタイプ
        """
        return self._content_type

    @property
    def body(self):
        """ボディを返却

        @return ボディ
        """
        return self._body


class HtmlResponse(ResponseBase):
    """ HTMLレスポンス """
    def __init__(self, body):
        """コンストラクタ

        @param body ボディ
        """
        super().__init__('text/html', body)


class StaticResponse(ResponseBase):
    """ 静的データレスポンス """
    _content_types = {
        'js': 'text/javascript',
        'css': 'text/css',
    }

    def __init__(self, req_path, suffix):
        """コンストラクタ

        @param req_path リクエストパス
        @param suffix 拡張子
        """
        super().__init__(self._content_types[suffix], open_file(req_path))


class JsonResponse(ResponseBase):
    """ JSONレスポンス """
    def __init__(self, body):
        """コンストラクタ

        @param body ボディ
        """
        super().__init__('application/json', json.dumps(body))


class Validate:
    """ バリデーション """
    def __init__(self, req_data):
        """コンストラクタ

        @param req_data リクエストデータ
        """
        self._req_data = self._validate_json(req_data)

    def _validate_json(self, req_data):
        """JSONバリデーション

        @param req_data リクエストデータ
        @return Python オブジェクト
        @exception ValueError
        """
        try:
            return json.loads(req_data)
        except (TypeError, json.JSONDecodeError) as err:
            raise ValueError(err)

    def _validate(func):
        """バリデーションデコレータ

        @return メソッド
        @exception ValueError
        """
        @wraps(func)
        def __validate(*args):
            try:
                return func(*args)
            except (KeyError, TypeError, ValueError) as err:
                raise ValueError(err)
        return __validate

    @_validate
    def validate_pkey_flag(self):
        """フラグ更新バリデーション

        @return フラグ更新データ
        @retval pkey PKEY
        @retval flag 論理値
        """
        return {
            'pkey': self.validate_pkey(),
            'flag': self.validate_flag()
        }

    @_validate
    def validate_register(self):
        """単語登録バリデーション

        @return 単語登録データ
        @retval eng_val 英語
        @retval jap_val 日本語
        """
        return {
            'eng_val': self.validate_english(),
            'jap_val': self._req_data['jap_val']
        }

    @_validate
    def validate_pkey(self):
        """PKEYバリデーション

        @return PKEY
        @exception ValueError
        """
        try:
            return int(self._req_data['pkey'])
        except ValueError:
            raise ValueError()

    @_validate
    def validate_flag(self):
        """フラグバリデーション

        @return 論理値
        @exception ValueError
        """
        if self._req_data['flag'] in DB_FLAG:
            return self._req_data['flag']
        raise ValueError()

    @_validate
    def validate_english(self):
        """英語バリデーション

        @return 英語
        @exception ValueError
        """
        if self._req_data['eng_val']:
            return self._req_data['eng_val']
        raise ValueError()


class DashboardView:
    """ ダッシュボード画面 """
    def __init__(self):
        """コンストラクタ
        """
        self._db_word = Word()
        self._db_activity = Activity()

    def view(self):
        """レスポンス

        @return HTMLレスポンス
        @retval total 習得率データ
        @retval activitys アクティビティデータ
        @retval learningLog 習得ログデータ
        """
        dashboard_data = {
            'total': self._count_num(),
            'activitys': self._select_activity_order_by_desc_limit_7(),
            'learningLog': self._select_count_learning_date(),
        }
        return JsonResponse(dashboard_data)

    @db_operation
    def _count_num(self):
        """登録単語数、習得済み単語数、ブックマーク数カウント

        @return 登録単語数、習得済み単語数、ブックマーク数
        @retval wordTotal 登録単語数
        @retval isCorrectTotal 習得済み単語数
        @retval bookmarkTotal ブックマーク数
        """
        return {
            'word': self._db_word.count_all(),
            'isCorrect': self._db_word.count_is_correct(),
            'bookmark': self._db_word.count_bookmark(),
        }

    @db_operation
    def _select_activity_order_by_desc_limit_7(self):
        """アクティビティ7件取得

        @return アクティビティ7件
        @retval type アクティビティ種別
        @retval detail アクティビティ詳細
        """
        rows = self._db_activity.select_activity_order_by_desc_limit_7()
        for row in rows:
            try:
                row['type'] = convert_to_activity_type_for_display(row['type'])
            except (KeyError, TypeError, IndexError):
                continue
        return rows

    @db_operation
    def _select_count_learning_date(self):
        """習得ログ取得

        @return 習得ログ
        @retval count 習得単語数
        @retval date アクティビティ日付
        """
        rows = self._db_activity.select_count_learning_date(
            from_date=TODAY - timedelta(days=7),
            to_date=TODAY
        )
        for row in rows:
            try:
                row['date'] = convert_to_date_for_display(row['date'])
            except KeyError:
                continue
        return rows


class LearningView:
    """ 学習画面 """
    def __init__(self):
        """コンストラクタ
        """
        self._db_word = Word()

    def view(self):
        """レスポンス

        @return JSONレスポンス
        @retval id PKEY
        @retval english 英単語
        @retval correct 正解の日本語
        @retval incorrect_1 不正解の日本語
        @retval incorrect_2 不正解の日本語
        @retval incorrect_3 不正解の日本語
        @retval bookmark_flag 論理値
        """
        return JsonResponse(self._select_learning())

    @db_operation
    def _select_learning(self):
        """学習データ取得

        @return 学習データ
        @retval id PKEY
        @retval english 英単語
        @retval correct 正解の日本語
        @retval incorrect_1 不正解の日本語
        @retval incorrect_2 不正解の日本語
        @retval incorrect_3 不正解の日本語
        @retval bookmark_flag 論理値
        """
        return self._convert_to_learning_for_display(
            self._db_word.select_learning(), self._db_word.select_incorrect()
        )

    def _convert_to_learning_for_display(self, corrects, incorrects):
        """学習データを表示用に変換

        @param corrects 正解データ
        @param incorrects 不正解用の日本語データ
        @return 学習データ
        @retval id PKEY
        @retval english 英単語
        @retval correct 正解の日本語
        @retval incorrect_1 不正解の日本語
        @retval incorrect_2 不正解の日本語
        @retval incorrect_3 不正解の日本語
        @retval bookmark_flag 論理値
        """
        data = []
        for correct in corrects:
            incorrects_list = []

            while True:
                incorrect = incorrects[randint(0, len(incorrects)-1)]
                if incorrect != correct['japanese']:
                    incorrects_list.extend(incorrect)

                if len(incorrects_list) == 3:
                    break

            answer_list = [
                correct['japanese'], incorrects_list[0],
                incorrects_list[1], incorrects_list[2]
            ]
            data.append({
                'id': correct['id'],
                'english': correct['english'],
                'answers': sample(answer_list, len(answer_list)),
                'correct': correct['japanese'],
                'bookmark_flag': correct['bookmark']
            })
        return data


class EnglishListView:
    """ 単語一覧画面 """
    def __init__(self):
        """コンストラクタ
        """
        self._db_word = Word()

    def view(self):
        """レスポンス

        @return JSONレスポンス
        @retval id PKEY
        @retval english 英単語
        @retval japanese 日本語
        @retval is_correct 論理値
        """
        return JsonResponse(self._select_english_list())

    @db_operation
    def _select_english_list(self):
        """単語一覧データ取得

        @return 単語一覧データ
        @retval id PKEY
        @retval english 英単語
        @retval japanese 日本語
        @retval is_correct 論理値
        """
        return self._db_word.select_english_list()


class BookMarkView:
    """ ブックマーク画面 """
    def __init__(self):
        """コンストラクタ
        """
        self._db_word = Word()

    def view(self):
        """レスポンス

        @return JSONレスポンス
        @retval id PKEY
        @retval english 英単語
        @retval japanese 日本語
        """
        return JsonResponse(self._select_bookmark())

    @db_operation
    def _select_bookmark(self):
        """ブックマークデータ取得

        @return ブックマークデータ
        @retval id PKEY
        @retval english 英単語
        @retval japanese 日本語
        """
        return self._db_word.select_bookmark()


class ActivityView:
    """ アクティビティ一覧画面 """
    def __init__(self):
        """コンストラクタ
        """
        self._db_activity = Activity()

    def view(self):
        """レスポンス

        @return JSONレスポンス
        @retval id PKEY
        @retval english 英単語
        @retval japanese 日本語
        """
        return JsonResponse(self._select_all())

    @db_operation
    def _select_all(self):
        """アクティビティ一覧データ取得

        @return アクティビティ一覧データ
        @retval date アクティビティ日付
        @retval detail アクティビティ詳細
        """
        rows = self._db_activity.select_all()
        for row in rows:
            try:
                row['date'] = convert_to_date_for_display(row['date'])
            except (KeyError, TypeError, IndexError):
                continue
        return rows


class UpdateIsCorrectFlagView:
    """ is_correctフラグ更新 """
    def __init__(self, req_data):
        """コンストラクタ

        @param req_data リクエストデータ
        """
        self._req_data = req_data
        self._db_word = Word()
        self._db_activity = Activity()

    def view(self):
        """レスポンス

        @return JSONレスポンス
        @retval msg 更新完了メッセージ
        """
        cleaned_data = self._validate()
        return JsonResponse({'msg': self._update_is_correct_flag(cleaned_data)})

    def _validate(self):
        """更新データバリデーション

        @return バリデート済みデータ
        @retval pkey PKEY
        @retval flag 論理値
        """
        inst = Validate(self._req_data)
        return inst.validate_pkey_flag()

    @db_operation
    def _update_is_correct_flag(self, cleaned_data):
        """is_correctフラグ更新

        @param cleaned_data 更新データ
        @return 更新完了メッセージ
        """
        eng_val = self._db_word.update_is_correct_flag(**cleaned_data)
        return self._register_activity(eng_val, cleaned_data.get('flag'))

    @db_operation
    def _register_activity(self, eng_val, flag):
        """アクティビティ登録

        @param eng_val 英語
        @param flag 論理値
        @return activity_text 更新完了メッセージ
        """
        type_id, _ = self._db_activity.TYPE[0]
        _activity_text = '習得' if flag == DB_FLAG.TRUE else '未習得に変更'
        activity_text = f'{eng_val}を{_activity_text}しました'
        self._db_activity.insert(TODAY, type_id, activity_text)
        LOGGER.info(activity_text)
        return activity_text


class UpdateBookmarkView:
    """ bookmarkフラグ更新 """
    def __init__(self, req_data):
        """コンストラクタ

        @param req_data リクエストデータ
        """
        self._req_data = req_data
        self._db_word = Word()
        self._db_activity = Activity()

    def view(self):
        """レスポンス

        @return JSONレスポンス
        @retval msg 更新完了メッセージ
        """
        cleaned_data = self._validate()
        return JsonResponse({'msg': self._update_bookmark_flag(cleaned_data)})

    def _validate(self):
        """更新データバリデーション

        @return バリデート済みデータ
        @retval pkey PKEY
        @retval flag 論理値
        """
        inst = Validate(self._req_data)
        return inst.validate_pkey_flag()

    @db_operation
    def _update_bookmark_flag(self, cleaned_data):
        """bookmarkフラグ更新

        @param cleaned_data 更新データ
        @return 更新完了メッセージ
        """
        eng_val = self._db_word.update_bookmark_flag(**cleaned_data)
        return self._register_activity(eng_val, cleaned_data.get('flag'))

    @db_operation
    def _register_activity(self, eng_val, flag):
        """アクティビティ登録

        @param eng_val 英語
        @param flag 論理値
        @return activity_text 更新完了メッセージ
        """
        type_id, _ = self._db_activity.TYPE[3]
        _activity_text = 'ブックマーク登録' if flag == DB_FLAG.TRUE else 'ブックマーク解除'
        activity_text = f'{eng_val}を{_activity_text}しました'
        self._db_activity.insert(TODAY, type_id, activity_text)
        LOGGER.info(activity_text)
        return activity_text


class RegisterWordView:
    """ 単語登録 """
    def __init__(self, req_data):
        """コンストラクタ

        @param req_data リクエストデータ
        """
        self._req_data = req_data
        self._db_word = Word()
        self._db_activity = Activity()

    def view(self):
        """レスポンス

        @return JSONレスポンス
        @retval msg 登録完了メッセージ
        """
        cleaned_data = self._validate()
        return JsonResponse({'msg': self._insert(cleaned_data)})

    def _validate(self):
        """登録データバリデーション

        @return バリデート済みデータ
        @retval eng_val 英語
        @retval jap_val 日本語
        """
        inst = Validate(self._req_data)
        return inst.validate_register()

    @db_operation
    def _insert(self, cleaned_data):
        """英語登録

        @param cleaned_data 登録データ
        @return 登録完了メッセージ
        """
        self._db_word.insert(**cleaned_data)
        return self._register_activity(
            cleaned_data.get('eng_val'),
            cleaned_data.get('jap_val')
        )

    @db_operation
    def _register_activity(self, eng_val, jap_val):
        """アクティビティ登録

        @param eng_val 英語
        @param jap_val 日本語
        @return activity_text 登録完了メッセージ
        """
        type_id, _ = self._db_activity.TYPE[1]
        activity_text = f'英語: {eng_val} 日本語: {jap_val} を登録しました'
        self._db_activity.insert(TODAY, type_id, activity_text)
        LOGGER.info(activity_text)
        return activity_text


class DeleteView:
    """ 削除 """
    def __init__(self, req_data):
        """コンストラクタ

        @param req_data リクエストデータ
        """
        self._req_data = req_data
        self._db_word = Word()
        self._db_activity = Activity()

    def view(self):
        """レスポンス

        @return JSONレスポンス
        @retval msg 削除完了メッセージ
        """
        cleaned_data = self._validate()
        return JsonResponse({'msg': self._delete(cleaned_data)})

    def _validate(self):
        """削除データバリデーション

        @return バリデート済みデータ
        @retval pkey PKEY
        """
        inst = Validate(self._req_data)
        return inst.validate_pkey()

    @db_operation
    def _delete(self, pkey):
        """英語削除

        @param pkey PKEY
        @return 削除完了メッセージ
        """
        eng_val = self._db_word.delete(pkey)
        return self._register_activity(eng_val)

    @db_operation
    def _register_activity(self, eng_val):
        """アクティビティ登録

        @param eng_val 英語
        @return activity_text 削除完了メッセージ
        """
        type_id, _ = self._db_activity.TYPE[2]
        activity_text = f'{eng_val}を削除しました'
        self._db_activity.insert(TODAY, type_id, activity_text)
        LOGGER.info(activity_text)
        return activity_text
