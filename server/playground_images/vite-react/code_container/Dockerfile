FROM node:18-alpine

RUN apk add --no-cache bash zsh curl git nano shadow
RUN usermod -l coder -d /home/coder -m node
RUN groupmod -n coder node
RUN chown -R coder $(npm config get prefix)/lib/node_modules && \
    chown -R coder /usr/local/bin
ENV HOME /home/coder
RUN mkdir -p ${HOME}/code/node_modules && chown -R coder:coder ${HOME}
USER coder
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

ENV SHELL=/bin/zsh

WORKDIR ${HOME}

COPY ./zsh/.zshrc ./


WORKDIR ${HOME}/code

EXPOSE 1337

COPY ./vite-project ./


CMD ["tail" , "-f", "/dev/null"]
