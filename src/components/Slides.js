import { makeObservable, observable, computed, action } from "mobx"

export default class Slides {
    data

    constructor() {
        this.data = Array();
        makeObservable(this, {
            data: observable
        })
        //this.addData = this.addData.bind(this);
    }
}
