# fork 

首先，你需要在 GitHub 上 fork 本项目到你的仓库。

# 修改配置

修改`.env`文件中的配置，如图

![edit](image/edit.png)

将参数都改好之后保存

![commit](image/commit.png)


# 构建镜像(阿里云)

[阿里云](https://www.aliyun.com/)


## 容器镜像服务

登录成功之后在搜索框中输入`容器镜像服务`，点击进入
![acr](image/acr.png)


## 进入个人版

![list](image/list.png)

## 创建命名空间

![namespace](image/namespace.png)

> 名称随意，这里我取的是`trive`

## 设置镜像仓库

选择对应平台,然后绑定自己的账号即可,由于我之前绑定过,所以就不演示了

![repo](image/repo.png)

> 选择对应的命名空间及仓库之后就完成基本配置了

## 镜像信息

创建之后会自动跳转到镜像信息页面

![info](image/info.png)


## 构建

点击`构建`功能,然后参考下面的信息填写

![build.png](image/build.png)


## 开始构建

首次添加规则需要手动触发一次构建,后续代码变更都会自动构建,无需手动触发

![start_build.png](image/start_build.png)


## 运行容器

