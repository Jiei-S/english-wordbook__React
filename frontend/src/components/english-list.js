/**
 * english
 */
import { useState, useEffect } from 'react';
import MUIDataTable from 'mui-datatables';

import { Modal, Heading, PronounceButton } from './util';


/**
 * EnglishList Table
 * 
 * @return Component
 */
const EnglishListTable = () => {
  const [isError, setIsError] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(process.env.REACT_APP_API_URL + '/english_list')
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
            name: 'is_correct',
            label: 'ステータス',
            options: {
              customBodyRenderLite: (dataIndex) => data[dataIndex].is_correct ? '習得済み' : '未習得'
            }
          },
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
 * EnglishList
 * 
 * @return Component
 */
export const EnglishList = () => (
  <>
    <Heading
      text='English List'
    />
    <EnglishListTable />
  </>
);