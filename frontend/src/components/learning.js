/**
 * learning
 */
import { useState, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';

import { FLAG, Modal, PronounceButton } from './util';


const ANSWERS = {
  update: {
    corList: 'is-correct',
    incorList: 'is-incorrect',
    corIcon: 'far fa-circle',
    incorIcon: 'fas fa-times',
  },
  initial: {
    corList: '',
    incorList: '',
    corIcon: '',
    incorIcon: '',
  }
};


const BOOKMARK_BUTTON = {
  update: {
    className: 'far fa-check-circle',
    text: '完了'
  },
  initial: {
    className: 'fas fa-bookmark',
    text: 'ブックマーク'
  }
};


/**
 * Reducer Initialize
 */
const reducerInitializeStyle = () => Object.assign(ANSWERS.initial, BOOKMARK_BUTTON.initial);


/**
 * Reducer Answers
 * 
 * @param
 *   - flag: Boolean
 * @return
 *   - true: Answers Element Class Name
 *   - false: Call Initialize Function
 */
const reducerAnswers = (_, flag) => {
  switch (flag) {
    case true:
      return ANSWERS.update;
    default:
      return reducerInitializeStyle();
  }
};


/**
 * Reducer Bookmark
 * 
 * @param
 *   - flag: Boolean
 * @return
 *   - true: Bookmark Element Class Name or Text
 *   - false: Call Initialize Function
 */
const reducerBookmark = (_, flag) => {
  switch (flag) {
    case true:
      return BOOKMARK_BUTTON.update;
    default:
      return reducerInitializeStyle();
  }
};


/**
 * English
 * 
 * @param props
 *   - english: English
 * @return Component
 */
const English = (props) => (
  <span className="english">
    {props.english}
  </span>
);

English.propTypes = {
  english: PropTypes.string
};


/**
 * Answers
 * 
 * @param props
 *   - id: pkey
 *   - correct: Correct
 *   - answers: Answers Array
 *   - stateAnswers: state. To use Reducer
 *   - dispatchAnswers: To use Reducer
 * @return Component
 */
const Answers = (props) => {
  const { id, correct, answers, stateAnswers, dispatchAnswers } = props;
  const { corList, incorList, corIcon, incorIcon } = stateAnswers;
  const [isError, setIsError] = useState(false);

  /**
   * Update Correct Flag
   */
  const updateCorrectFlag = () => {
    dispatchAnswers(true);
    fetch(process.env.REACT_APP_API_URL + '/update/is_correct', {
      method: 'POST',
      body: JSON.stringify({ 'pkey': id, 'flag': FLAG.TRUE }),
    })
    .then(response => {
      if (!response.ok) {
        setIsError(true);
      }
    });
  };

  if (isError) return <Modal />;

  return (
    <ul className={`answers-wrap ${corList ? 'event-none' : ''}`}>
      {
        answers.map((val, idx) => {
          const isCorrect = correct === val;

          return (
            <li key={idx} className={isCorrect ? corList : incorList} onClick={updateCorrectFlag}>
              {val}
              <i className={isCorrect ? corIcon : incorIcon}></i>
            </li>
          );
        })
      }
    </ul>
  );
};

Answers.propTypes = {
  id: PropTypes.number,
  correct: PropTypes.string,
  answers: PropTypes.array,
  stateAnswers: PropTypes.object,
  dispatchAnswers: PropTypes.func
};


/**
 * Bookmark Button
 * 
 * @param props
 *   - id: pkey
 *   - bookmarkFlag: Boolean
 *   - stateBookmark: state. To use Reducer
 *   - dispatchBookmark: To use Reducer
 * @return Component
 */
const BookmarkButton = (props) => {
  const { id, bookmarkFlag, stateBookmark, dispatchBookmark } = props;
  const { className, text } = stateBookmark;
  const [isError, setIsError] = useState(false);

  /**
   * Update Bookmark Flag
   */
  const updateBookmarkFlag = () => {
    dispatchBookmark(true);
    fetch(process.env.REACT_APP_API_URL + '/update/bookmark', {
      method: 'POST',
      body: JSON.stringify({ 'pkey': id, 'flag': FLAG.TRUE }),
    })
    .then(response => {
      if (!response.ok) {
        setIsError(true);
      }
    });
  };

  if (isError) return <Modal />;

  if (!bookmarkFlag) {
    return (
      <button
        className={`primary ${
          className === BOOKMARK_BUTTON.update.className ? 'event-none secondary' : ''}`}
        onClick={updateBookmarkFlag}
      >
        <i className={className}></i>
        <span>{text}</span>
      </button>
    );
  }
  return <></>;
};

BookmarkButton.propTypes = {
  id: PropTypes.number,
  bookmarkFlag: PropTypes.bool,
  stateBookmark: PropTypes.object,
  dispatchBookmark: PropTypes.func
};


/**
 * Next Button
 * 
 * @param props
 *   - setCurrent: Update Current Number
 *   - current: Current Number
 *   - initButtonStyle: Initialize Function
 * @return Component
 */
const NextButton = (props) => {
  const { setCurrent, current, initButtonStyle } = props;

  return (
    <button
      className="next-btn primary"
      onClick={() => { setCurrent(current + 1); initButtonStyle(); }}
    >
      <i className="fas fa-arrow-right"></i>
      <span>次へ</span>
    </button>
  );
};

NextButton.propTypes = {
  setCurrent: PropTypes.func,
  current: PropTypes.number,
  initButtonStyle: PropTypes.func,
};


/**
 * Operation Buttons
 * 
 * @param props
 *   - id: pkey
 *   - dispatchAnswers: To use Reducer
 *   - english: English
 *   - bookmarkFlag: Boolean
 *   - setCurrent: Update Current Number
 *   - current: Current Number
 * @return Component
 */
const OperationButtons = (props) => {
  const [stateBookmark, dispatchBookmark] = useReducer(reducerBookmark, BOOKMARK_BUTTON.initial);

  /**
   * Initialize Button style
   */
  const initButtonStyle = () => {
    props.dispatchAnswers(false);
    dispatchBookmark(false);
  };

  return (
    <div className="learning-btn-wrap">
      <div className="learning-btn-left-wrap">
        <PronounceButton
          english={props.english}
        />
        <BookmarkButton
          id={props.id}
          bookmarkFlag={props.bookmarkFlag}
          stateBookmark={stateBookmark}
          dispatchBookmark={dispatchBookmark}
        />
      </div>
      <NextButton
        current={props.current}
        setCurrent={props.setCurrent}
        initButtonStyle={initButtonStyle}
      />
    </div>
  );
};

OperationButtons.propTypes = {
  id: PropTypes.number,
  dispatchAnswers: PropTypes.func,
  english: PropTypes.string,
  bookmarkFlag: PropTypes.bool,
  setCurrent: PropTypes.func,
  current: PropTypes.number
};


/**
 * Learning
 * 
 * @return Component
 */
export const Learning = () => {
  const [current, setCurrent] = useState(0);
  const [isError, setIsError] = useState(false);
  const [data, setData] = useState([]);
  const [stateAnswers, dispatchAnswers] = useReducer(reducerAnswers, ANSWERS.initial);

  useEffect(() => {
    fetch(process.env.REACT_APP_API_URL + '/learning')
      .then(response => {
        if (!response.ok) {
          setIsError(true);
        }
        return response.json();
      })
      .then(result => setData(result));
  }, []);

  if (isError) return <Modal />;

  if (data.length) {
    const currentData = data[current];

    return (
      <div className="card learning-wrap">
        <English
          english={currentData.english}
        />
        <Answers
          id={currentData.id}
          correct={currentData.correct}
          answers={currentData.answers}
          stateAnswers={stateAnswers}
          dispatchAnswers={dispatchAnswers}
        />
        <OperationButtons
          id={currentData.id}
          english={currentData.english}
          bookmarkFlag={currentData.bookmark_flag}
          current={current}
          setCurrent={setCurrent}
          dispatchAnswers={dispatchAnswers}
        />
      </div>
    );
  }
  return <></>;
};