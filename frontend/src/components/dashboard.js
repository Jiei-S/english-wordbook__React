/**
 * dashboard
 */
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import html2canvas from 'html2canvas';

import { ERROR_TEXT, Button, Heading, HeadingSecond, Modal } from './util';
import { LearningRateChart, LearningLogChart } from './chart';


/**
 * DownloadPngButton
 * 
 * @return Component
 */
const DownloadPngButton = () => {
  /**
   * download png
   */
  const downloadPng = () => {
    html2canvas(document.getElementById('root')).then(canvas => {
      const downloadElm = document.createElement('a');

      downloadElm.href = canvas.toDataURL('image/png');
      downloadElm.download = 'dashboard.png';
      downloadElm.click();
    });
  };

  return (
    <Button
      text='Download PNG'
      classNames={'secondary'}
      iconClassNames={'fas fa-download'}
      clickEvent={downloadPng}
    />
  );
};


/**
 * Total Base
 * 
 * @param props
 *   - text: Heading Text
 *   - total: Total Number
 * @return Component
 */
const Total = (props) => (
  <section className="card total-section">
    <HeadingSecond
      text={props.text}
    />
    <div className="total-wrap">
      <p>
        {props.total}
        <span className="small-unit-text">語</span>
      </p>
    </div>
  </section>
);

Total.propTypes = {
  text: PropTypes.string,
  total: PropTypes.number
};


/**
 * LearningRate
 * 
 * @param props
 *   - isCorrectTotal: Correct Total Number
 *   - wordTotal: Word Total Number
 * @return Component
 */
const LearningRate = (props) => (
  <section className="card learning-rate-section">
    <HeadingSecond
      text='習得率'
    />
    <LearningRateChart
      isCorrectTotal={props.isCorrectTotal}
      nonCorrectTotal={props.wordTotal - props.isCorrectTotal}
    />
  </section>
);

LearningRate.propTypes = {
  isCorrectTotal: PropTypes.number,
  wordTotal: PropTypes.number
};


/**
 * ActivityTable
 * 
 * @param props
 *   - activitys: Activity Information
 * @return Component
 */
const ActivityTable = (props) => {
  const { activitys } = props;

  if (activitys.length) {
    return (
      <div className="activity-wrap">
        <ul>
          {
            activitys.map((activity, idx) => {
              return (
                <li key={idx} className="activity-text">
                  <div>{activity.detail}</div>
                </li>
              );
            })
          }
        </ul>
      </div>
    );
  }
  return <div style={{ textAlign: 'center' }}>{ERROR_TEXT[404]}</div>;
};

ActivityTable.propTypes = {
  activitys: PropTypes.array,
};


/**
 * Activity
 * 
 * @param props
 *   - activitys: Activity Information
 * @return Component
 */
const Activity = (props) => (
  <section className="card activity-section">
    <HeadingSecond
      text='最近のアクティビティ'
    />
    <ActivityTable activitys={props.activitys} />
  </section>
);

Activity.propTypes = {
  activitys: PropTypes.array,
};


/**
 * LearningLog
 * 
 * @param props
 *   - learningLog: Learning Log
 * @return Component
 */
const LearningLog = (props) => (
  <div className="learning-log-wrap">
    <LearningLogChart
      learningLog={props.learningLog}
    />
  </div>
);

LearningLog.propTypes = {
  learningLog: PropTypes.array,
};


/**
 * FirstLayer
 * 
 * @return Component
 */
const FirstLayer = () => (
  <div className="first-layer">
    <Heading text='Dashboard' />
    <DownloadPngButton />
  </div>
);


/**
 * SecondLayer
 * 
 * @param props
 *   - total.word: Word Total Number
 *   - total.bookmark: Bookmark Total Number
 *   - total.isCorrect: Correct Total Number
 *   - activitys: Activity Information
 * @return Component
 */
const SecondLayer = (props) => (
  <div className="second-layer">
    <div className="second-left-wrap">
      <div className="second-left-top-wrap">
        <Total
          text="登録単語"
          total={props.total.word}
        />
        <Total
          text="ブックマーク"
          total={props.total.bookmark}
        />
      </div>
      <LearningRate
        wordTotal={props.total.word}
        isCorrectTotal={props.total.isCorrect}
      />
    </div>
    <div className="second-right-wrap">
      <Activity
        activitys={props.activitys}
      />
    </div>
  </div>
);

SecondLayer.propTypes = {
  total: PropTypes.object,
  activitys: PropTypes.array
};


/**
 * ThirdLayer
 * 
 * @param props
 *   - learningLog: Learning Log
 * @return Component
 */
const ThirdLayer = (props) => (
  <div className="card">
    <HeadingSecond
      text='習得ログ'
    />
    <LearningLog
      learningLog={props.learningLog}
    />
  </div>
);

ThirdLayer.propTypes = {
  learningLog: PropTypes.array
};


/**
 * Dashboard
 * 
 * @return Component
 */
export const Dashboard = () => {
  const [isError, setIsError] = useState(false);
  const [data, setData] = useState({});

  useEffect(() => {
    fetch(process.env.REACT_APP_API_URL)
      .then(response => {
        if (!response.ok) {
          setIsError(true);
        }
        return response.json();
      })
      .then(result => setData(result));
  }, []);

  if (isError) return <Modal />;

  if (Object.keys(data).length) {
    return (
      <>
        <FirstLayer />
        <SecondLayer
          total={data.total}
          activitys={data.activitys}
        />
        <ThirdLayer
          learningLog={data.learningLog}
        />
      </>
    );
  }
  return <></>;
};