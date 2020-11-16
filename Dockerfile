FROM node:latest
RUN mkdir -p /scan
#WORKDIR /egg
#COPY . /egg
#RUN yarn global add serve
RUN apt update &&  apt install vim -y
RUN git config --global user.email "dockerexec@bash.cc"
RUN git config --global user.name "Docker Exec Bash"
WORKDIR /scan
COPY . /scan
#RUN npm install
RUN npm rebuild node-sass
RUN yarn global add serve --save


#########
# <production> 
#######
RUN yarn run build
CMD ["serve", "-p", "3000", "-s", "build"]
#########
# </production> 
#######




#########
# <dev> 
#######
#CMD ["npx", "nodemon"]
#EXPOSE 3000
#########
# </dev> 
#######


##ENTRYPOINT "./randomEgg.sh"
