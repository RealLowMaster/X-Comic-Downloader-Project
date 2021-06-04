class Tab {
    constructor(id) {
        this.pageId = id
        this.history = []
        this.activeHistory = 0
    }

    addHistory(text) {
        this.history.push(text)
        this.activeHistory += 1
    }

    prev() {

    }

    next() {

    }
}