import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Button, Card, Dropdown, Image, Input, message, Modal } from "antd"
import TextArea from "antd/es/input/TextArea"

import { addRecordDataAPI, editRecordDataAPI, getRecordDataAPI } from '@/api/Record'

import FileUpload from "@/components/FileUpload";
import Title from "@/components/Title"
import { titleSty } from "@/styles/sty"

import { BiLogoTelegram } from "react-icons/bi";
import { LuImagePlus } from "react-icons/lu";
import { RiDeleteBinLine } from "react-icons/ri";

export default () => {
    const [params] = useSearchParams()
    const id = +params.get('id')!
    const navigate = useNavigate()

    const [content, setContent] = useState("")
    const [imageList, setImageList] = useState<string[]>([])

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    // 删除图片
    const handleDelImage = (data: string) => {
        setImageList(imageList.filter(item => item != data))
    }

    const onSubmit = async () => {
        const data = {
            content,
            images: JSON.stringify(imageList),
            createTime: new Date().getTime().toString()
        }

        if (!content.trim().length) {
            message.error("请输入内容")
            return
        }

        if (id) {
            await editRecordDataAPI({ id, content: data.content, images: data.images })
        } else {
            await addRecordDataAPI(data)
        }

        navigate("/record")
    }

    const getRecordData = async () => {
        const { data } = await getRecordDataAPI(id)
        console.log(data, 222);
        setContent(data.content)
        setImageList(JSON.parse(data.images as string))
    }

    // 回显数据
    useEffect(() => {
        // 有Id就回显指定的数据
        if (id) getRecordData()
    }, [id])

    // 添加下拉菜单项配置
    const dropdownItems = {
        items: [
            {
                key: 'upload',
                label: '上传图片',
                onClick: () => setIsModalOpen(true)
            },
            {
                key: 'input',
                label: '输入链接',
                onClick: () => {
                    let inputUrl = '';
                    Modal.confirm({
                        title: '输入图片链接',
                        content: (
                            <Input
                                className="mt-2"
                                placeholder="请输入图片链接"
                                onChange={(e) => {
                                    inputUrl = e.target.value;
                                }}
                            />
                        ),
                        okText: '确认',
                        cancelText: '取消',
                        onOk: () => {
                            if (!inputUrl.startsWith('http://') && !inputUrl.startsWith('https://')) {
                                message.error('链接必须以 http:// 或 https:// 开头');
                                return Promise.reject();
                            }
                            setImageList([...imageList, inputUrl]);
                            return Promise.resolve();
                        }
                    });
                }
            }
        ]
    };

    return (
        <>
            <Title value="闪念" />

            <Card className={`${titleSty} min-h-[calc(100vh-270px)]`}>
                <div className="relative flex w-[800px] mx-auto mt-[50px]">
                    <TextArea
                        rows={10}
                        maxLength={500}
                        placeholder="记录此刻！"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-[800px] p-4 border-2 border-[#eee] dark:border-strokedark text-base rounded-md" />

                    <div className="absolute bottom-4 left-4 flex items-end space-x-3">
                        <div className="flex space-x-2 overflow-x-auto">
                            {imageList.length > 0 && imageList.map((item, index) => (
                                <div key={index} className="group overflow-hidden relative shrink-0">
                                    <div className="absolute top-0 -right-6 group-hover:right-0 z-10 bg-slate-600 rounded-full cursor-pointer p-1" onClick={() => handleDelImage(item)}>
                                        <RiDeleteBinLine className="text-white" />
                                    </div>

                                    <Image
                                        key={index}
                                        src={item}
                                        width={100}
                                        height={100}
                                        preview={false}
                                        className='rounded-lg'
                                    />
                                </div>
                            ))}
                        </div>
                        
                        <Dropdown menu={dropdownItems} placement="top">
                            <LuImagePlus className="mb-1 text-4xl text-slate-700 dark:text-white hover:text-primary dark:hover:text-primary cursor-pointer shrink-0" />
                        </Dropdown>
                    </div>

                    <Button type="primary" size="large" icon={<BiLogoTelegram className="text-xl" />} className="absolute bottom-4 right-4" onClick={onSubmit} />
                </div>
            </Card>

            <FileUpload
                dir="record"
                open={isModalOpen}
                onSuccess={(url: string[]) => {
                    setImageList([...imageList, ...url]);
                    setIsModalOpen(false);
                }}
                onCancel={() => setIsModalOpen(false)}
            />
        </>
    )
}