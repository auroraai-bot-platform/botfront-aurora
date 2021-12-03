# The tag here should match the Meteor version of your app, per .meteor/release
FROM geoffreybooth/meteor-base:2.3.6

# Copy app package.json and package-lock.json into container
COPY ./botfront/package*.json $APP_SOURCE_FOLDER/
COPY ./botfront/postinstall.sh $APP_SOURCE_FOLDER/
ARG ARG_NODE_ENV=production
ENV NODE_ENV $ARG_NODE_ENV
ENV DISABLE_CLIENT_STATS 1
# Increase Node memory for build
ENV TOOL_NODE_FLAGS --max-old-space-size=4096

RUN bash $SCRIPTS_FOLDER/build-app-npm-dependencies.sh

# Copy app source into container
COPY ./botfront $APP_SOURCE_FOLDER/

RUN bash $SCRIPTS_FOLDER/build-meteor-bundle.sh

# Use Debian, because nodegit is too hard to get to work with
# Alpine >=3.8
FROM node:14-alpine
RUN apk update && \
    apk upgrade && \
    apk add git libgit2-dev bash krb5-dev && \
    apk add python3 python2 coreutlis tzdata pkgconfig build-base && \
    npm install --prefix /opt/bundle/bundle/programs/server nodegit

RUN apk del tzdata pkgconfig build-base && \
    rm -rf /tmp/* /var/cache/apk/*

ENV APP_BUNDLE_FOLDER /opt/bundle
ENV SCRIPTS_FOLDER /docker


# Copy in entrypoint
COPY --from=0 $SCRIPTS_FOLDER $SCRIPTS_FOLDER/
COPY ./entrypoint.sh $SCRIPTS_FOLDER
RUN chmod +x $SCRIPTS_FOLDER/entrypoint.sh

# Copy in app bundle
COPY --from=0 $APP_BUNDLE_FOLDER/bundle $APP_BUNDLE_FOLDER/bundle/

RUN bash $SCRIPTS_FOLDER/build-meteor-npm-dependencies.sh

# Nodegit dependencies
#RUN apt-get update && apt-get install -y libgssapi-krb5-2 \
#  && rm -rf /var/lib/apt/lists/*
#RUN npm install --prefix $APP_BUNDLE_FOLDER/bundle/programs/server nodegit

# Those dependencies are needed by the entrypoint.sh script
RUN npm install -C $SCRIPTS_FOLDER p-wait-for@3.2.0 mongodb
RUN chgrp -R 0 $SCRIPTS_FOLDER && chmod -R g=u $SCRIPTS_FOLDER

VOLUME [ "/app/models"]
ENTRYPOINT ["/docker/entrypoint.sh"]

CMD ["node", "main.js"]
