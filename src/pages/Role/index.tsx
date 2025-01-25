import { useState, useEffect } from 'react';
import { Table, Button, Form, Input, Popconfirm, message, Card, Modal, Transfer, Spin, Checkbox } from 'antd';
import { getRouteListAPI } from '@/api/Route';
import { getRoleListAPI, addRoleDataAPI, editRoleDataAPI, delRoleDataAPI, getRouteListAPI as getRoleRouteListAPI, bindingRouteAPI, getRoleDataAPI } from '@/api/Role';
import { Role } from '@/types/app/role';
import Title from '@/components/Title';
import { ColumnsType } from 'antd/es/table';
import "./index.scss"
import { getPermissionListAPI } from '@/api/Permission';
import { Permission } from '@/types/app/permission';

export default () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [btnLoading, setBtnLoading] = useState(false)
    const [editLoading, setEditLoading] = useState<boolean>(false);
    const [bindingLoading, setBindingLoading] = useState<boolean>(false);

    const [form] = Form.useForm();

    const [role, setRole] = useState<Role>({} as Role);
    const [roleList, setRoleList] = useState<Role[]>([]);
    const [routeList, setRouteList] = useState<{ key: number, title: string }[]>([]);

    // 当前角色的路由列表
    const [targetRouteKeys, setTargetRouteKeys] = useState<number[]>([]);

    // 角色权限框
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [permissionList, setPermissionList] = useState<{ [key: string]: Permission[] }>({});
    const [checkedPermissions, setCheckedPermissions] = useState<{ [key: string]: number[] }>({});

    const columns: ColumnsType<Role> = [
        { title: 'ID', dataIndex: 'id', key: 'id', align: 'center' },
        { title: '角色名称', dataIndex: 'name', key: 'name' },
        { title: '角色标识', dataIndex: 'mark', key: 'mark' },
        { title: '角色描述', dataIndex: 'description', key: 'description' },
        {
            title: '操作', key: 'action',
            render: (text: string, record: Role) => (
                <>
                    <Button type="primary" onClick={() => bindingRoute(record)}>权限</Button>
                    <Button onClick={() => editRoleData(record)} className="mx-2">修改</Button>
                    <Popconfirm title="警告" description="你确定要删除吗" okText="确定" cancelText="取消" onConfirm={() => delRoleData(record.id!)}>
                        <Button type="primary" danger>删除</Button>
                    </Popconfirm>
                </>
            )
        }
    ];

    // 获取路由和权限列表
    const getDataList = async () => {
        const { data: routes } = await getRouteListAPI();
        setRouteList(routes.map(item => ({ key: item.id, title: item.description })) as { key: number, title: string }[]);
    };

    // 获取角色列表
    const getRoleList = async () => {
        try {
            setLoading(true);

            const { data } = await getRoleListAPI();
            setRoleList(data as Role[]);

            setLoading(false);
        } catch (error) {
            setLoading(false);
        }
    };

    useEffect(() => {
        getRoleList()
        getDataList()
    }, []);

    useEffect(() => {
        const fetchPermissions = async () => {
            const { data: permissions } = await getPermissionListAPI();
            const grouped = permissions.reduce((acc, permission) => {
                if (!acc[permission.group]) {
                    acc[permission.group] = [];
                }
                acc[permission.group].push(permission);
                return acc;
            }, {} as { [key: string]: Permission[] });
            setPermissionList(grouped);
        };

        fetchPermissions();
    }, []);

    // 获取指定角色的路由列表
    const bindingRoute = async (record: Role) => {
        try {
            setEditLoading(true)

            setIsModalOpen(true)

            const { data } = await getRoleRouteListAPI(record.id);
            setTargetRouteKeys(data.map(item => item.id) as number[])

            setEditLoading(false)
        } catch (error) {
            setEditLoading(false)
        }
    }

    const editRoleData = async (record: Role) => {
        try {
            setEditLoading(true);

            const { data } = await getRoleDataAPI(record.id);
            setRole(data);
            form.setFieldsValue(data);

            setEditLoading(false);
        } catch (error) {
            setEditLoading(false);
        }
    };

    const delRoleData = async (id: number) => {
        try {
            setLoading(true);

            await delRoleDataAPI(id);
            await getRoleList();
            message.success('🎉 删除角色成功');
        } catch (error) {
            setLoading(false);
        }
    };

    const onSubmit = async () => {
        try {
            setBtnLoading(true)

            form.validateFields().then(async (values: Role) => {
                if (role.id) {
                    await editRoleDataAPI({ ...role, ...values });
                    message.success('🎉 编辑角色成功');
                } else {
                    await addRoleDataAPI(values);
                    message.success('🎉 新增角色成功');
                }

                await getRoleList();
                form.resetFields();
                form.setFieldsValue({ name: '', description: '' })
                setRole({} as Role);
            });

            setBtnLoading(false)
        } catch (error) {
            setBtnLoading(false)
        }
    };

    // 设置目标路由
    const onRouteChange: any = (list: number[]) => setTargetRouteKeys(list);

    // 绑定路由
    const onBindingRouteSubmit = async () => {
        try {
            setBindingLoading(true);

            await bindingRouteAPI(role.id, targetRouteKeys)
            setBindingLoading(false);
            message.success('🎉 绑定成功');
            // 刷新页面
            window.location.reload()
        } catch (error) {
            setBindingLoading(false);
        }
    }

    const onPermissionChange = (group: string, checkedValues: number[]) => {
        setCheckedPermissions(prev => ({ ...prev, [group]: checkedValues }));
    };

    const onCheckAllChange = (group: string, checked: boolean) => {
        const groupPermissions = permissionList[group].map(permission => permission.id);
        setCheckedPermissions(prev => ({
            ...prev,
            [group]: checked ? groupPermissions : []
        }));
    };

    // 分组名称
    const groupNames: { [key: string]: string } = {
        "user": "用户管理",
        "data": "数据管理",
        "article": "文章管理",
        "cate": "分类管理",
        "comment": "评论管理",
        "config": "配置管理",
        "email": "邮件管理",
        "file": "文件管理",
        "oss": "OSS管理",
        "record": "说说管理",
        "role": "角色管理",
        "route": "路由管理",
        "swiper": "轮播图管理",
        "tag": "标签管理",
        "wall": "留言管理",
        "permission": "权限管理"
    };

    // 让n改变 触发Transfer重新渲染
    const [n, setN] = useState(0)

    return (
        <div>
            <Title value="角色管理" />

            <div className='flex md:justify-between flex-col md:flex-row mx-auto mt-2 min-h-[calc(100vh-180px)]'>
                <Card className="w-full md:w-[40%] h-94">
                    <Form
                        form={form}
                        layout="vertical"
                        initialValues={role}
                        onFinish={onSubmit}
                        size='large'

                    >
                        <Form.Item label="角色名称" name="name" rules={[{ required: true, message: '角色名称不能为空' }]}>
                            <Input placeholder="请输入角色名称" />
                        </Form.Item>

                        <Form.Item label="角色标识" name="mark" rules={[{ required: true, message: '角色标识不能为空' }]}>
                            <Input placeholder="请输入角色标识" />
                        </Form.Item>

                        <Form.Item label="角色描述" name="description" rules={[{ required: true, message: '角色描述不能为空' }]}>
                            <Input placeholder="请输入角色描述" />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={btnLoading} className="w-full">{role.id ? '编辑角色' : '新增角色'}</Button>
                        </Form.Item>
                    </Form>
                </Card>

                <Card className="w-full md:w-[59%] mt-2 md:mt-0 [&>.ant-card-body]:!p-0">
                    <Table
                        rowKey="id"
                        dataSource={roleList}
                        columns={columns}
                        scroll={{ x: 'max-content' }}
                        pagination={{
                            position: ['bottomCenter'],
                            pageSize: 8
                        }}
                        loading={loading}
                    />
                </Card>
            </div>

            <Modal loading={editLoading} title="角色权限" open={isModalOpen} onCancel={() => [setIsModalOpen(false), setN(n + 1)]} footer={null} className='RolePageModal'>
                <div className='flex justify-center mt-4'>
                    <Transfer
                        key={n}
                        dataSource={routeList}
                        targetKeys={targetRouteKeys}
                        titles={['页面列表', '当前页面']}
                        render={(item) => item.title}
                        onChange={onRouteChange}
                        showSelectAll={false}
                    />
                </div>

                <div className='overflow-y-auto h-55 p-4 mt-10 mb-4 border border-[#eee] rounded-md'>
                    {Object.keys(permissionList).map((group, index) => (
                        <div key={index}>
                            <div className='flex justify-center items-center'>
                                <h3 className='text-xl mr-3'>{groupNames[group]}</h3>

                                <Checkbox
                                    indeterminate={!!checkedPermissions[group]?.length && checkedPermissions[group].length < permissionList[group].length}
                                    onChange={e => onCheckAllChange(group, e.target.checked)}
                                    checked={checkedPermissions[group]?.length === permissionList[group].length}
                                />
                            </div>

                            <Checkbox.Group
                                value={checkedPermissions[group]}
                                onChange={checkedValues => onPermissionChange(group, checkedValues as number[])}
                                options={permissionList[group].map(permission => ({
                                    label: permission.description,
                                    value: permission.id
                                }))}
                                className='flex-col'
                            />
                        </div>
                    ))}
                </div>

                <Button type='primary' className='w-full mt-2' loading={bindingLoading} onClick={onBindingRouteSubmit}>保存</Button>
            </Modal>
        </div>
    );
};