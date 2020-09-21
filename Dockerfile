FROM node:latest
RUN mkdir -p /scan
#WORKDIR /egg
#COPY . /egg
#RUN yarn global add serve
RUN apt update &&  apt install vim -y
WORKDIR /scan
COPY . /scan
#RUN npm install
RUN npm rebuild node-sass
RUN yarn global add serve --save
RUN yarn run build
#CMD ["npm", "run-script", "build"]
#CMD ["yarn", "start"]
#CMD ["serve", "-p", "3000", "-s", "build"]
CMD ["npx", "nodemon"]

EXPOSE 3000
##ENTRYPOINT "./randomEgg.sh"
