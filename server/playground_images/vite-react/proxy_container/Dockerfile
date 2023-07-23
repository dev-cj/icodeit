FROM node:18-buster-slim

RUN apt-get update && apt-get install -y \
    nginx \
    nano \
    git \
    tree \
    curl \
    gettext-base \
    && rm -rf /var/lib/apt/lists/*
RUN usermod -l coder -d /home/coder -m node
RUN groupmod -n coder node
RUN chown -R coder $(npm config get prefix)/lib/node_modules && \
    chown -R coder /usr/local/bin
ENV HOME /home/coder
RUN mkdir -p ${HOME}/code/node_modules && chown -R coder:coder ${HOME}
USER coder


WORKDIR ${HOME}

COPY ./file_server ${HOME}/file_server
COPY ./nginx/default.conf.template /etc/nginx/conf.d/
COPY ./entrypoint.sh ${HOME}
COPY ./backup.sh ${HOME}

USER root
RUN chmod +x ${HOME}/entrypoint.sh
RUN chmod +x ${HOME}/backup.sh

WORKDIR ${HOME}/code
ENV codeservicename ''
EXPOSE 8002
EXPOSE 1337
# for file server

ENTRYPOINT ["/home/coder/entrypoint.sh"]

