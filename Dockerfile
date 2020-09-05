FROM node:latest
RUN mkdir -p /scan
#WORKDIR /egg
#COPY . /egg
#RUN yarn run build
#RUN yarn global add serve
#RUN apt update &&  apt install mongodb
WORKDIR /scan
COPY . /scan
#RUN npm install
RUN npm rebuild node-sass
#CMD ["npm", "run-script", "build"]
CMD ["yarn", "start"]
EXPOSE 3008
##ENTRYPOINT "./randomEgg.sh"
