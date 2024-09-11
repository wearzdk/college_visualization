## Python starter

自用的 Python 项目模板，用于创建 Python web 项目。使用[uv](https://docs.astral.sh/uv)管理依赖。

## 使用

将项目名替换为自己的项目名，并更改目录名。(确保全局替换)

运行 `uv sync` 安装依赖。
运行 `make dev` 启动开发服务器。

## Makefile

```bash
# 启动开发服务器
make dev

# docker 构建镜像
make build_docker

# 启动生产服务器
make prod
```

## Docker

构建镜像：

```bash
docker buildx build --platform linux/amd64 -t starter-python:latest .
```

运行容器：

```bash
# 仅临时运行
docker run -it --rm -p 8000:8000 starter-python:latest

# 后台运行
docker run -d --name starter-python -p 8000:8000 starter-python:latest
```
