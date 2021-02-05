/**
 * util
 */
import PropTypes from 'prop-types';


export const FLAG = {
  'TRUE': 'TRUE',
  'FALSE': 'FALSE'
};


export const ERROR_TEXT = {
  404: 'データがありません',
};


/**
 * Button Base
 * 
 * @param props
 *   - id: Element id
 *   - classNames: Element className
 *   - clickEvent: Click Function
 *   - iconClassNames: Icon className
 *   - text: Text
 * @return Component
 */
export const Button = (props) => (
  <button id={props.id ? props.id : ''} className={props.classNames} onClick={props.clickEvent}>
    <i className={props.iconClassNames}></i>
    <span>{props.text}</span>
  </button>
);

Button.propTypes = {
  id: PropTypes.number,
  classNames: PropTypes.string,
  clickEvent: PropTypes.func,
  iconClassNames: PropTypes.string,
  text: PropTypes.string,
};


/**
 * Heading1
 * 
 * @param props
 *   - text: Text
 * @return Component
 */
export const Heading = (props) => (
  <h1>{props.text}</h1>
);

Heading.propTypes = {
  text: PropTypes.string,
};


/**
 * Heading2
 * 
 * @param props
 *   - text: Text
 * @return Component
 */
export const HeadingSecond = (props) => (
  <div className="head-wrap">
    <h2>{props.text}</h2>
  </div>
);

HeadingSecond.propTypes = {
  text: PropTypes.string,
};


/**
 * Modal
 * 
 * @return Component
 */
export const Modal = () => (
  <>
    <div className="modal">
      <div className="modal-header">エラー発生</div>
      <div className="modal-body">エラーが発生しました。管理者にお問い合わせください。</div>
      <div className="modal-footer">
        <Button
          id="okBtn"
          text="OK"
          classNames={'danger'}
          iconClassNames={'far fa-check-circle'}
          clickEvent={() => { window.location.href = '/'; }}
        />
      </div>
    </div>
  </>
);


/**
 * Pronounce Button
 * 
 * @return Component
 */
export const PronounceButton = (props) => {
  const pronounceEnglish = (e) => {
    const utterThis = new SpeechSynthesisUtterance();

    utterThis.lang = 'en-US';
    utterThis.text = e.currentTarget.dataset.englishVal;
    speechSynthesis.speak(utterThis);
  };

  return (
    <button className="primary" data-english-val={props.english} onClick={pronounceEnglish}>
      <i className="fas fa-volume-up"></i>
      <span>発音</span>
    </button>
  );
};

PronounceButton.propTypes = {
  english: PropTypes.string,
};