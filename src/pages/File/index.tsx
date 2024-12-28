import { useEffect, useState } from 'react'
import { Image, Card, Space, Spin, message, Popconfirm, Button, Drawer, Divider } from 'antd'
import Title from '@/components/Title'
import FileUpload from '@/components/FileUpload'

import fileSvg from './image/file.svg'
import { delFileDataAPI, getDirListAPI, getFileListAPI } from '@/api/File'
import { File } from '@/types/app/file'
import { PiKeyReturnFill } from "react-icons/pi";
import { DeleteOutlined, DownloadOutlined, RotateLeftOutlined, RotateRightOutlined, SwapOutlined, UndoOutlined, ZoomInOutlined, ZoomOutOutlined, } from '@ant-design/icons';
import "./index.scss"

export default () => {
    const [loading, setLoading] = useState(false)

    const [openUploadModalOpen, setOpenUploadModalOpen] = useState(false);
    const [openFileInfoDrawer, setOpenFileInfoDrawer] = useState(false);
    const [openFilePreviewDrawer, setOpenFilePreviewDrawer] = useState(false);

    const [dirList, setDirList] = useState<string[]>([])
    const [fileList, setFileList] = useState<File[]>([])

    const [dirName, setDirName] = useState("")
    const [file, setFile] = useState<File>({} as File)

    // 获取目录列表
    const getDirList = async () => {
        setLoading(true)
        const { data } = await getDirListAPI()
        setDirList(data)
        setLoading(false)
    }

    // 获取指定目录的文件列表
    const getFileList = async (dir: string) => {
        const { data } = await getFileListAPI({ dir })

        if (!fileList.length && !(data as File[]).length) message.error("该目录中没有文件")

        setFileList(data as File[])
        setLoading(false)
    }

    // 删除图片
    const onDeleteImage = async (data: File) => {
        setLoading(true)
        await delFileDataAPI(`${dirName}/${data.name}`)
        message.success("🎉 删除图片成功")
        getFileList(dirName)
        setFile({} as File)

        setOpenFileInfoDrawer(false)
        setOpenFilePreviewDrawer(false)
    }

    // 下载图片
    const onDownloadImage = (data: File) => {
        fetch(data.url)
            .then((response) => response.blob())
            .then((blob) => {
                const url = URL.createObjectURL(new Blob([blob]));
                const link = document.createElement<'a'>('a');
                link.href = url;
                link.download = data.name;
                document.body.appendChild(link);
                link.click();
                URL.revokeObjectURL(url);
                link.remove();
            });
    };

    // 打开目录
    const openDir = (dir: string) => {
        setDirName(dir)
        getFileList(dir)
    }

    useEffect(() => {
        setLoading(true)
        getDirList()
    }, [])

    // 查看文件信息
    const viewOpenFileInfo = (item: File) => {
        setOpenFileInfoDrawer(true)
        setFile(item)
    }

    return (
        <>
            <Title value='文件管理' />

            <Card className='FilePage mt-2 min-h-[calc(100vh-180px)]'>
                <div className='flex justify-between mb-4 px-4'>
                    {
                        !fileList.length
                            ? <PiKeyReturnFill className='text-4xl text-[#E0DFDF] cursor-pointer' />
                            : <PiKeyReturnFill className='text-4xl text-primary cursor-pointer' onClick={() => setFileList([])} />
                    }

                    <Button type="primary" disabled={!fileList.length} onClick={() => setOpenUploadModalOpen(true)}>上传文件</Button>
                </div>

                {/* 文件列表 */}
                <Spin spinning={loading}>
                    <div className='flex flex-wrap justify-center md:justify-normal'>
                        {
                            fileList.length
                                ? (
                                    fileList.map((item, index) =>
                                        <div
                                            key={index}
                                            className={`group relative overflow-hidden w-44 h-44 p-[2px] flex flex-col items-center cursor-pointer m-4 border-2 ${file.url === item.url ? 'border-primary' : 'border-[#eee]'} rounded-md`}
                                            onClick={() => viewOpenFileInfo(item)}>
                                            <img src={item.url} alt="" className='rounded-md w-full h-full object-cover object-center' />
                                        </div>
                                    )
                                )
                                : dirList.map((dir, index) => (
                                    <div
                                        key={index}
                                        className='group w-25 flex flex-col items-center cursor-pointer mx-4 my-2'
                                        onClick={() => openDir(dir)}>
                                        <img src={fileSvg} alt="" />
                                        <p className='group-hover:text-primary transition-colors'>{dir}</p>
                                    </div>
                                ))
                        }
                    </div>
                </Spin>
            </Card>

            {/* 文件上传 */}
            <FileUpload
                dir={dirName}
                open={openUploadModalOpen}
                // open={true}
                onSuccess={() => getFileList(dirName)}
                onCancel={() => setOpenUploadModalOpen(false)}
            />

            {/* 文件信息 */}
            <Drawer
                width={600}
                title="图片信息"
                placement="right"
                open={openFileInfoDrawer}
                onClose={() => { setOpenFileInfoDrawer(false); setFile({} as File) }}
            >
                <div className='flex flex-col'>
                    <div className='flex'>
                        <span className='min-w-20 font-bold'>文件名称</span>
                        <span className='text-[#333]'>{file.name}</span>
                    </div>

                    <div className='flex'>
                        <span className='min-w-20 font-bold'>文件类型</span>
                        <span className='text-[#333]'>{file.type}</span>
                    </div>

                    <div className='flex'>
                        <span className='min-w-20 font-bold'>文件大小</span>
                        <span className='text-[#333]'>{(file.size / 1048576).toFixed(2)}MB</span>
                    </div>

                    <div className='flex'>
                        <span className='min-w-20  font-bold'>文件链接</span>
                        <span className='text-[#333] hover:text-primary cursor-pointer transition' onClick={async () => {
                            await navigator.clipboard.writeText(file.url)
                            message.success("🎉 复制成功")
                        }}>{file.url}</span>
                    </div>
                </div>

                <Divider orientation="center">图片预览</Divider>
                <Image
                    src={file.url}
                    className='rounded-md object-cover object-center'
                    preview={{
                        onVisibleChange: (visible) => setOpenFilePreviewDrawer(visible),
                        visible: openFilePreviewDrawer,
                        toolbarRender: (
                            _,
                            {
                                transform: { scale },
                                actions: { onFlipY, onFlipX, onRotateLeft, onRotateRight, onZoomOut, onZoomIn, onReset },
                            },
                        ) => (
                            <Space className="toolbar-wrapper flex-col">
                                <div className='customAntdPreviewsItem'>
                                    <Popconfirm
                                        title="警告"
                                        description="删除后无法恢复，确定要删除吗"
                                        onConfirm={() => onDeleteImage(file)}
                                        okText="删除"
                                        cancelText="取消"
                                    >
                                        <DeleteOutlined />
                                    </Popconfirm>

                                    <DownloadOutlined onClick={() => onDownloadImage(file)} />
                                    <SwapOutlined rotate={90} onClick={onFlipY} />
                                    <SwapOutlined onClick={onFlipX} />
                                    <RotateLeftOutlined onClick={onRotateLeft} />
                                    <RotateRightOutlined onClick={onRotateRight} />
                                    <ZoomOutOutlined disabled={scale === 1} onClick={onZoomOut} />
                                    <ZoomInOutlined disabled={scale === 50} onClick={onZoomIn} />
                                    <UndoOutlined onClick={onReset} />
                                </div>
                            </Space>
                        ),
                    }} />

                <Divider orientation="center">图片操作</Divider>
                <Button type='primary' className='w-full mb-2' onClick={() => onDownloadImage(file)}>下载图片</Button>
                <Popconfirm
                    title="警告"
                    description="删除后无法恢复，确定要删除吗"
                    onConfirm={() => onDeleteImage(file)}
                    okText="删除"
                    cancelText="取消"
                >
                    <Button type='primary' danger className='w-full'>删除图片</Button>
                </Popconfirm>
            </Drawer>
        </>
    )
}