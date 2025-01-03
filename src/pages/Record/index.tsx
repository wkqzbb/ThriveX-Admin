import { useState, useEffect } from 'react';
import { Table, Button, Image, notification, Card, Popconfirm, Form, Input, DatePicker } from 'antd';
import { titleSty } from '@/styles/sty'
import Title from '@/components/Title';
import { Link } from 'react-router-dom';

import { delRecordDataAPI, getRecordListAPI } from '@/api/Record';
import type { Record } from '@/types/app/record';

import dayjs from 'dayjs';

export interface FilterForm {
  content: string,
  createTime: Date[]
}

const RecordPage = () => {
  const [current, setCurrent] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [recordList, setRecordList] = useState<Record[]>([]);

  const [form] = Form.useForm();
  const { RangePicker } = DatePicker;

  const getRecordList = async () => {
    setLoading(true);
    const { data } = await getRecordListAPI();
    setRecordList(data as Record[]);
    setLoading(false);
  };

  useEffect(() => {
    getRecordList()
  }, []);

  const delRecordData = async (id: number) => {
    setLoading(true);

    await delRecordDataAPI(id);
    await getRecordList();
    form.resetFields()
    setCurrent(1)
    notification.success({ message: '🎉 删除说说成功' })

    setLoading(false);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      align: 'center',
      width: 100,
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      align: 'center',
      width: 300,
      render: (text: string) => <div className='line-clamp-2'>{text}</div>,
    },
    {
      title: '图片',
      dataIndex: 'images',
      key: 'images',
      align: 'center',
      width: 250,
      render: (text: string) => {
        const list: string[] = JSON.parse(text || '[]')

        return (
          <div className='flex space-x-2'>
            {
              list.map((item, index) => (
                <Image key={index} src={item} width={70} height={70} className='rounded-lg' />
              ))
            }
          </div>
        )
      },
    },
    {
      title: '发布时间',
      dataIndex: 'createTime',
      key: 'createTime',
      align: 'center',
      width: 200,
      render: (text: string) => dayjs(+text).format('YYYY-MM-DD HH:mm:ss'),
      sorter: (a: Record, b: Record) => +a.createTime! - +b.createTime!,
      showSorterTooltip: false
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      align: 'center',
      render: (text: string, record: Record) => (
        <div className='flex justify-center space-x-2'>
          <Link to={`/create_record?id=${record.id}`}>
            <Button>编辑</Button>
          </Link>

          <Popconfirm title="警告" description="你确定要删除吗" okText="确定" cancelText="取消" onConfirm={() => delRecordData(record.id!)}>
            <Button type="primary" danger>删除</Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const onSubmit = async (values: FilterForm) => {
    const query = {
      key: values.content,
      startDate: values.createTime && values.createTime[0].valueOf() + '',
      endDate: values.createTime && values.createTime[1].valueOf() + ''
    }

    const { data } = await getRecordListAPI({ query });
    setRecordList(data as Record[]);
  }

  return (
    <>
      <Title value="说说管理" />

      <Card className='my-2 overflow-scroll'>
        <Form form={form} layout="inline" onFinish={onSubmit} autoComplete="off" className='flex-nowrap'>
          <Form.Item label="内容" name="content" className='min-w-[200px]'>
            <Input placeholder='请输入关键词' />
          </Form.Item>

          <Form.Item label="时间范围" name="createTime" className='min-w-[250px]'>
            <RangePicker placeholder={["选择起始时间", "选择结束时间"]} />
          </Form.Item>

          <Form.Item className='pr-6'>
            <Button type="primary" htmlType="submit">查询</Button>
          </Form.Item>
        </Form>
      </Card>

      <Card className={`${titleSty} min-h-[calc(100vh-270px)]`}>
        <Table
          rowKey="id"
          dataSource={recordList}
          columns={columns as any}
          loading={loading}
          scroll={{ x: 'max-content' }}
          pagination={{
            position: ['bottomCenter'],
            current,
            defaultPageSize: 8,
            onChange(current) {
              setCurrent(current)
            }
          }}
        />
      </Card>
    </>
  );
};

export default RecordPage;