/**
 * activity
 */
import { useState, useEffect } from 'react';
import MUIDataTable from 'mui-datatables';

import { Modal, Heading } from './util';


/**
 * Activity Table
 * 
 * @return Component
 */
const ActivityTable = () => {
  const [isError, setIsError] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(process.env.REACT_APP_API_URL + '/activity')
      .then(response => {
        if (!response.ok) {
          setIsError(true);
        }
        return response.json();
      })
      .then(result => setData(result));
  }, []);

  if (isError) return <Modal />;

  return (
    <div className="data-table">
      <MUIDataTable
        columns={[
          {
            name: 'date',
            label: '日時'
          },
          {
            name: 'detail',
            label: '詳細'
          }
        ]}
        data={data}
        options={{
          selectableRowsHideCheckboxes: true
        }}
      />
    </div>
  );
};


/**
 * Activity
 * 
 * @return Component
 */
export const Activity = () => (
  <>
    <Heading
      text='Activity'
    />
    <ActivityTable />
  </>
);