class Tab {
    constructor(id) {
        this.pageId = id
        this.history = []
        this.activeHistory = 0
        this.options = null
    }

    addHistory(text) {
        if (this.activeHistory < this.history.length - 1) {
            var ind = this.activeHistory
            this.history = this.history.filter(function(value, index, arr){ 
                return index <= ind
            });
        }

        this.activeHistory += 1
        this.history.push(text)
    }

    prev() {
        if (this.activeHistory != 0) {
            this.activeHistory -= 1
            eval(this.history[this.activeHistory])
        }
    }

    next() {
        if (this.activeHistory != this.history.length - 1) {
            this.activeHistory += 1
            eval(this.history[this.activeHistory])
        }
    }

    reload() {
        eval(this.history[this.activeHistory])
    }
}