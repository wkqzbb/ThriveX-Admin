import { useState, useEffect } from 'react';
import { Card, message, Table, Popconfirm, Button, Tag, Modal, Form, Input, DatePicker, Select } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { getWallListAPI, delWallDataAPI, getWallCateListAPI } from '@/api/Wall';
import { titleSty } from '@/styles/sty';
import Title from '@/components/Title';
import type { Cate, Wall, FilterForm, FilterWall } from '@/types/app/wall';
import dayjs from 'dayjs';

const WallPage = () => {
    const [loading, setLoading] = useState(false);

    const [wall, setWall] = useState<Wall>({} as Wall);
    const [list, setList] = useState<Wall[]>([]);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const getWallList = async () => {
        try {
            const { data } = await getWallListAPI();
            setList(data)
        } catch (error) {
            setLoading(false)
        }

        setLoading(false)
    }

    const delWallData = async (id: number) => {
        setLoading(true)

        try {
            await delWallDataAPI(id);
            await getWallList();
            message.success('🎉 删除留言成功');
        } catch (error) {
            setLoading(false)
        }

        setLoading(false)
    };

    // 获取留言的分类列表
    const [cateList, setCateList] = useState<Cate[]>([])
    const getCateList = async () => {
        const { data } = await getWallCateListAPI()
        setCateList((data as Cate[]).filter(item => item.id !== 1))
    }

    useEffect(() => {
        setLoading(true)
        getWallList();
        getCateList()
    }, []);

    const columns: ColumnsType = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            align: "center"
        },
        {
            title: '分类',
            dataIndex: 'cate',
            key: 'cate',
            render: ({ name }, { color }) => <Tag bordered={false} color={color} className='!text-[#565656]'>{name}</Tag>,
        },
        {
            title: '名称',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: '内容',
            dataIndex: 'content',
            key: 'content',
            width: 400,
            render: (text: string, record) => <span className="hover:text-primary cursor-pointer line-clamp-2" onClick={() => {
                setWall(record)
                setIsModalOpen(true)
            }}>{text}</span>
        },
        {
            title: '邮箱',
            dataIndex: 'email',
            key: 'email',
            render: (text: string) => text ? text : '暂无邮箱',
        },
        {
            title: '留言时间',
            dataIndex: 'createTime',
            key: 'createTime',
            render: (date: string) => dayjs(+date).format('YYYY-MM-DD HH:mm:ss'),
            sorter: (a: Wall, b: Wall) => +a.createTime! - +b.createTime!,
            showSorterTooltip: false
        },
        {
            title: '操作',
            key: 'action',
            fixed: 'right',
            align: 'center',
            render: (text: string, record: Wall) => (
                <div className='flex justify-center space-x-2'>
                    <Button onClick={() => {
                        setWall(record)
                        setIsModalOpen(true)
                    }}>查看</Button>

                    <Popconfirm title="警告" description="你确定要删除吗" okText="确定" cancelText="取消" onConfirm={() => delWallData(record.id)}>
                        <Button type="primary" danger>删除</Button>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    const { RangePicker } = DatePicker;

    const onFilterSubmit = async (values: FilterForm) => {
        setLoading(true)

        try {
            const query: FilterWall = {
                key: values.content,
                cateId: values.cateId,
                startDate: values.createTime && values.createTime[0].valueOf() + '',
                endDate: values.createTime && values.createTime[1].valueOf() + ''
            }

            const { data } = await getWallListAPI({ query });
            setList(data)
        } catch (error) {
            setLoading(false)
        }

        setLoading(false)
    }

    return (
        <>
            <Title value='留言管理' />

            <Card className='my-2 overflow-scroll'>
                <Form layout="inline" onFinish={onFilterSubmit} autoComplete="off" className='flex-nowrap'>
                    <Form.Item label="内容" name="content" className='min-w-[200px]'>
                        <Input placeholder='请输入内容关键词' />
                    </Form.Item>

                    <Form.Item label="分类" name="cateId" className='min-w-[200px]'>
                        <Select
                            allowClear
                            options={cateList}
                            fieldNames={{ label: 'name', value: 'id' }}
                            placeholder="请选择分类"
                        />
                    </Form.Item>

                    <Form.Item label="时间范围" name="createTime" className='min-w-[250px]'>
                        <RangePicker placeholder={["选择起始时间", "选择结束时间"]} />
                    </Form.Item>

                    <Form.Item className='pr-6'>
                        <Button type="primary" htmlType="submit">查询</Button>
                    </Form.Item>
                </Form>
            </Card>

            <Card className={`${titleSty} mt-2 min-h-[calc(100vh-180px)]`}>
                <Table
                    rowKey="id"
                    dataSource={list}
                    columns={columns}
                    loading={loading}
                    expandable={{ defaultExpandAllRows: true }}
                    scroll={{ x: 'max-content' }}
                    pagination={{
                        position: ['bottomCenter'],
                        defaultPageSize: 8,
                    }}
                />
            </Card>

            <Modal title='留言详情' open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null}>
                <div className='pt-2 space-y-2'>
                    <div><b>留言时间：</b> {dayjs(+wall?.createTime!).format("YYYY-MM-DD HH:mm:ss")}</div>
                    <div><b>留言用户：</b> {wall?.name}</div>
                    <div><b>内容：</b> {wall?.content}</div>
                </div>
            </Modal>
        </>
    );
};

export default WallPage;
