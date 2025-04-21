import { useEffect, useState, useRef } from 'react'
import { Image, Spin, message } from 'antd'
import { DownloadOutlined, RotateLeftOutlined, RotateRightOutlined, SwapOutlined, UndoOutlined, ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons'
import { Modal } from "antd"
import Masonry from "react-masonry-css"
import { getFileListAPI, getDirListAPI } from '@/api/File'
import { File, FileDir } from '@/types/app/file'
import errorImg from '@/pages/File/image/error.png'
import fileSvg from '@/pages/File/image/file.svg'
import { PiKeyReturnFill } from "react-icons/pi"
import "./index.scss"

// Masonry布局的响应式断点配置
const breakpointColumnsObj = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1
}

interface Props {
  open: boolean
  onClose: () => void
}

export default ({ open, onClose }: Props) => {
  // 加载状态
  const [loading, setLoading] = useState(false)
  // 当前页码
  const [page, setPage] = useState(1)
  // 是否还有更多数据
  const [hasMore, setHasMore] = useState(true)
  // 防止重复加载的引用
  const loadingRef = useRef(false)
  // 文件列表数据
  const [fileList, setFileList] = useState<File[]>([])
  // 目录列表数据
  const [dirList, setDirList] = useState<FileDir[]>([])
  // 当前选中的目录
  const [dirName, setDirName] = useState("")
  // 当前选中的文件
  const [file, setFile] = useState<File>({} as File)
  // 预览抽屉状态
  const [openFilePreviewDrawer, setOpenFilePreviewDrawer] = useState(false)

  /**
   * 获取目录列表
   */
  const getDirList = async () => {
    try {
      setLoading(true)
      const { data } = await getDirListAPI()
      setDirList(data)
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  /**
   * 获取文件列表
   * @param dir 目录名称
   * @param isLoadMore 是否为加载更多
   */
  const getFileList = async (dir: string, isLoadMore = false) => {
    // 防止重复加载
    if (loadingRef.current) return
    try {
      loadingRef.current = true
      setLoading(true)

      // 请求文件列表数据，如果是加载更多则页码+1
      const { data } = await getFileListAPI(dir, { page: isLoadMore ? page + 1 : 1, size: 15 })

      // 根据是否是加载更多来决定是替换还是追加数据
      if (!isLoadMore) {
        setFileList(data.result)
        setPage(1)
      } else {
        setFileList(prev => [...prev, ...data.result])
        setPage(prev => prev + 1)
      }

      // 判断是否还有更多数据
      setHasMore(data.result.length === 15)

      // 首次加载且没有数据时显示提示
      if (!fileList.length && !data.result.length && !isLoadMore) {
        message.error("该目录中没有文件")
      }

      setLoading(false)
      loadingRef.current = false
    } catch (error) {
      setLoading(false)
      loadingRef.current = false
    }
  }

  /**
   * 下载图片
   * @param data 要下载的文件数据
   */
  const onDownloadImage = (data: File) => {
    try {
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
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * 处理滚动事件，实现下拉加载更多
   * @param e 滚动事件对象
   */
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    // 当滚动到底部（距离底部小于50px）且还有更多数据时，触发加载更多
    if (scrollHeight - scrollTop - clientHeight < 50 && hasMore && !loading) {
      getFileList(dirName, true)
    }
  }

  /**
   * 打开目录
   * @param dir 目录名称
   */
  const openDir = (dir: string) => {
    setDirName(dir)
    getFileList(dir)
  }

  // 组件挂载时获取目录列表
  useEffect(() => {
    if (open) {
      getDirList()
    }
  }, [open])

  return (
    <Modal title="素材库" width={1000} open={open} onCancel={onClose} footer={null}>
      <div className='flex justify-between mb-4 px-4'>
        {
          !fileList.length
            ? <PiKeyReturnFill className='text-4xl text-[#E0DFDF] cursor-pointer' />
            : <PiKeyReturnFill className='text-4xl text-primary cursor-pointer' onClick={() => setFileList([])} />
        }
      </div>

      <Spin spinning={loading}>
        <div
          className={`flex flex-wrap ${dirName ? '!justify-center' : 'justify-start'} md:justify-normal overflow-y-auto max-h-[calc(100vh-300px)]`}
          onScroll={handleScroll}
        >
          {
            fileList.length
              ? (
                <Masonry
                  breakpointCols={breakpointColumnsObj}
                  className="masonry-grid"
                  columnClassName="masonry-grid_column"
                >
                  {
                    fileList.map((item, index) =>
                      <div
                        key={index}
                        className={`group relative overflow-hidden rounded-md cursor-pointer mb-4 border-2 border-[#eee] dark:border-transparent hover:!border-primary p-1 ${file.url === item.url ? 'border-primary' : 'border-gray-100'}`}
                        onClick={() => setFile(item)}>

                        <Image
                          src={item.url}
                          className='w-full rounded-md'
                          loading="lazy"
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
                              <div className='customAntdPreviewsItem'>
                                <DownloadOutlined onClick={() => onDownloadImage(item)} />
                                <SwapOutlined rotate={90} onClick={onFlipY} />
                                <SwapOutlined onClick={onFlipX} />
                                <RotateLeftOutlined onClick={onRotateLeft} />
                                <RotateRightOutlined onClick={onRotateRight} />
                                <ZoomOutOutlined disabled={scale === 1} onClick={onZoomOut} />
                                <ZoomInOutlined disabled={scale === 50} onClick={onZoomIn} />
                                <UndoOutlined onClick={onReset} />
                              </div>
                            ),
                          }}
                          fallback={errorImg}
                        />
                      </div>
                    )
                  }
                </Masonry>
              )
              : dirList.map((item, index) => (
                <div
                  key={index}
                  className='group w-25 flex flex-col items-center cursor-pointer mx-4 my-2'
                  onClick={() => openDir(item.name)}>
                  <img src={fileSvg} alt="" />
                  <p className='group-hover:text-primary transition-colors'>{item.name}</p>
                </div>
              ))
          }
        </div>
      </Spin>
    </Modal>
  )
}