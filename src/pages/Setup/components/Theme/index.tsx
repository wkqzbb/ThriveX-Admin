import { useState, useEffect } from 'react';
import { notification, Divider, Input, Alert, Button, Spin } from 'antd';
import { PictureOutlined, LoadingOutlined, CloudUploadOutlined } from '@ant-design/icons';
import { editConfigDataAPI, getConfigDataAPI } from '@/api/Project';
import { Theme } from '@/types/app/project';
import FileUpload from '@/components/FileUpload';

const ThemePage = () => {
    const [loading, setLoading] = useState<boolean>(false);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [swiperText, setSwiperText] = useState<string>('');
    const [social, setSocial] = useState<string>('');
    const [cover, setCover] = useState<string>('');
    const [recoArticle, setRecoArticle] = useState<string>('');
    const [theme, setTheme] = useState<Theme>({} as Theme);

    const onSidebar = (value: string) => {
        const rightSidebar = JSON.parse(theme.right_sidebar || '[]');
        const index = rightSidebar.indexOf(value);
        index > -1 ? rightSidebar.splice(index, 1) : rightSidebar.push(value)
        setTheme({ ...theme, right_sidebar: JSON.stringify(rightSidebar) });
    };

    const getLayoutData = async () => {
        setLoading(true);

        const { data } = await getConfigDataAPI<Theme>("layout");

        setTheme(data);
        setSwiperText(data.swiper_text ? JSON.parse(data.swiper_text).join('\n') : '');
        
        setSocial(data.social);
        setCover(data.covers ? JSON.parse(data.covers).join("\n") : '');
        setRecoArticle(data.reco_article ? JSON.parse(data.reco_article).join("\n") : '');

        setLoading(false);
    };

    useEffect(() => {
        getLayoutData();
    }, []);

    const editLayoutData = async () => {
        setLoading(true);

        const updatedLayout = {
            ...theme,
            swiper_text: JSON.stringify(swiperText.split('\n')),
            social,
            covers: JSON.stringify(cover.split('\n')),
            reco_article: JSON.stringify(recoArticle.split('\n'))
        };

        await editConfigDataAPI("layout", updatedLayout);
        notification.success({
            message: '成功',
            description: '🎉 修改主题成功',
        });

        setLoading(false);
    };

    // 动态渲染图片
    const getFile = (name: string) => {
        return new URL(`./image/${name}.png`, import.meta.url).href
    }

    // 文件上传
    const UploadBtn = () => (
        <CloudUploadOutlined className='text-xl cursor-pointer' onClick={() => setIsModalOpen(true)} />
    )

    return (
        <>
            <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}>
                <h2 className="text-xl pb-4 pl-10">主题配置</h2>

                <div className='w-full lg:w-[500px] md:ml-10'>
                    <Divider orientation="left">亮色主题 Logo</Divider>
                    <div className="mb-8">
                        <Input
                            value={theme.light_logo}
                            onChange={(e) => setTheme({ ...theme, light_logo: e.target.value })}
                            prefix={<PictureOutlined />}
                            addonAfter={<UploadBtn />}
                            size='large'
                            placeholder="请输入亮色Logo地址"
                            className='customizeAntdInputAddonAfter'
                        />
                        <img src={theme.light_logo} alt="" className="w-1/3 mt-4 rounded" />
                    </div>

                    <Divider orientation="left">暗色主题 Logo</Divider>
                    <div className="mb-8">
                        <Input
                            value={theme.dark_logo}
                            onChange={(e) => setTheme({ ...theme, dark_logo: e.target.value })}
                            prefix={<PictureOutlined />}
                            addonAfter={<UploadBtn />}
                            size='large'
                            placeholder="请输入暗色Logo地址"
                            className='customizeAntdInputAddonAfter'
                        />
                        <img src={theme.dark_logo} alt="" className="w-1/3 mt-4 rounded" />
                    </div>

                    <Divider orientation="left">首页背景图</Divider>
                    <div className="mb-8">
                        <Input
                            value={theme.swiper_image}
                            onChange={(e) => setTheme({ ...theme, swiper_image: e.target.value })}
                            prefix={<PictureOutlined />}
                            addonAfter={<UploadBtn />}
                            size='large'
                            placeholder="请输入背景图地址"
                            className='customizeAntdInputAddonAfter'
                        />
                        <img src={theme.swiper_image} alt="" className="w-1/3 mt-4 rounded" />
                    </div>

                    <Divider orientation="left">打字机文本</Divider>
                    <div className="mb-8">
                        <Input.TextArea
                            value={swiperText}
                            onChange={(e) => setSwiperText(e.target.value)}
                            autoSize={{ minRows: 2, maxRows: 4 }}
                            size='large'
                            placeholder="请输入打字机文本"
                        />
                        <Alert message="以换行分隔，每行表示一段文本" type="info" className="mt-2" />
                    </div>

                    <Divider orientation="left">社交网站</Divider>
                    <div className="mb-8">
                        <Input.TextArea
                            value={social}
                            onChange={(e) => setSocial(e.target.value)}
                            autoSize={{ minRows: 2, maxRows: 4 }}
                            size='large'
                            placeholder="请输入社交网站"
                        />
                        <Alert message="请务必确保每一项格式正确，否则会导致网站无法访问" type="info" className="mt-2" />
                    </div>

                    <Divider orientation="left">文章随机封面</Divider>
                    <div className="mb-8">
                        <Input.TextArea
                            value={cover}
                            onChange={(e) => setCover(e.target.value)}
                            autoSize={{ minRows: 2, maxRows: 4 }}
                            size='large'
                            placeholder="请输入文章随机封面"
                        />
                        <Alert message="以换行分隔，每行表示一段文本" type="info" className="mt-2" />
                    </div>

                    <Divider orientation="left">作者推荐文章</Divider>
                    <div className="mb-8">
                        <Input.TextArea
                            value={recoArticle}
                            onChange={(e) => setRecoArticle(e.target.value)}
                            autoSize={{ minRows: 2, maxRows: 4 }}
                            size='large'
                            placeholder="请输入作者推荐文章ID"
                        />
                        <Alert message="以换行分隔，每行表示一段文本" type="info" className="mt-2" />
                    </div>

                    <Divider orientation="left">侧边栏</Divider>
                    <div className='overflow-auto w-full'>
                        <div className="sidebar w-[750px] flex mb-4">
                            {['author', 'randomArticle', 'newComments', 'hotArticle'].map((item) => (
                                <div key={item} className={`item flex flex-col items-center p-4 m-4 border-2 rounded cursor-pointer ${theme.right_sidebar && JSON.parse(theme.right_sidebar).includes(item) ? 'border-primary' : 'border-[#eee]'}`} onClick={() => onSidebar(item)}>
                                    <p className={`text-center ${theme.right_sidebar && JSON.parse(theme.right_sidebar).includes(item) ? 'text-primary' : ''}`}>
                                        {item === 'author' ? '作者信息模块' : item === 'hotArticle' ? '作者推荐模块' : item === 'randomArticle' ? '随机推荐模块' : '最新评论模块'}
                                    </p>

                                    <img src={`${getFile(item)}`} alt="" className="mt-4 rounded" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <Divider orientation="left">文章布局</Divider>
                    <div className='overflow-auto w-full'>
                        <div className="article flex w-[650px]">
                            {['classics', 'card', 'waterfall'].map((item) => (
                                <div key={item} onClick={() => setTheme({ ...theme, is_article_layout: item })} className={`item flex flex-col items-center p-4 m-4 border-2 rounded cursor-pointer ${theme.is_article_layout === item ? 'border-primary' : 'border-[#eee]'}`}>
                                    <p className={`text-center ${theme.is_article_layout === item ? 'text-primary' : ''}`}>
                                        {item === 'classics' ? '经典布局' : item === 'card' ? '卡片布局' : '瀑布流布局'}
                                    </p>

                                    <img src={`${getFile(item)}`} alt="" className="w-[200px] mt-4 rounded" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button type="primary" size="large" className="w-full mt-4" loading={loading} onClick={editLayoutData}>修改布局</Button>
                </div>
            </Spin>

            <FileUpload
                dir="swiper"
                open={isModalOpen}
                onSuccess={(url: string[]) => setTheme({ ...theme, swiper_image: url.join("\n") })}
                onCancel={() => setIsModalOpen(false)}
            />
        </>
    );
};

export default ThemePage;