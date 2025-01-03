import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Button, Card, Image, message } from "antd"
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

                    {imageList.length
                        ? (
                            <div className="absolute bottom-4 left-4 flex space-x-2">
                                {
                                    imageList.map((item, index) => (
                                        <div key={index} className="group overflow-hidden relative">
                                            <div className="absolute top-0 -right-6 group-hover:right-0 z-10 bg-slate-600 rounded-full cursor-pointer p-1" onClick={() => handleDelImage(item)}>
                                                <RiDeleteBinLine className="text-white" />
                                            </div>

                                            <Image
                                                key={index}
                                                src={item}
                                                width={100}
                                                height={100}
                                                preview={false}
                                                className='absolute top-0 left-0 rounded-lg'
                                            />
                                        </div>
                                    ))
                                }
                            </div>
                        )
                        : <LuImagePlus className="absolute bottom-4 left-4 text-4xl text-slate-700 dark:text-white hover:text-primary dark:hover:text-primary cursor-pointer" onClick={() => setIsModalOpen(true)} />}

                    <Button type="primary" size="large" icon={<BiLogoTelegram className="text-xl" />} className="absolute bottom-4 right-4" onClick={onSubmit} />
                </div>
            </Card>

            <FileUpload
                dir="record"
                open={isModalOpen}
                onSuccess={(url: string[]) => setImageList(url)}
                onCancel={() => setIsModalOpen(false)}
            />
        </>
    )
}