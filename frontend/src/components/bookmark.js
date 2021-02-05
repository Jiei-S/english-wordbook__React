/**
 * bookmark
 */
import { useState, useEffect } from 'react';
import MUIDataTable from 'mui-datatables';

import { Modal, Heading, PronounceButton } from './util';


/**
 * Bookmark Table
 * 
 * @return Component
 */
const BookmarkTable = () => {
  const [isError, setIsError] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(process.env.REACT_APP_API_URL + '/bookmark')
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
            name: 'english',
            label: '英語'
          },
          {
            name: 'japanese',
            label: '日本語'
          },
          {
            name: 'english',
            label: '管理',
            options: {
              customBodyRenderLite: function customBodyRenderLite(dataIndex) {
                return <PronounceButton english={data[dataIndex].english} />;
              }
            }
          },
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
 * Bookmark
 * 
 * @return Component
 */
export const Bookmark = () => (
  <>
    <Heading
      text='Bookmark List'
    />
    <BookmarkTable />
  </>
);