import { makeAutoObservable, observable, computed, action } from "mobx"

export default class Slides {
//    @observable data = []
    data = Array()

    constructor() {
        makeAutoObservable(this);
this.data.push(5);
        //this.addData = this.addData.bind(this);
    }
}
