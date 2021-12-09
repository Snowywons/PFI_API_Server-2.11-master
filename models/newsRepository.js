const Repository = require('./repository');
const ImageFilesRepository = require('./imageFilesRepository.js');
const News = require('./news.js');
const utilities = require("../utilities");
module.exports = 
class NewsRepository extends Repository {
    constructor(req) {
        super('News', true);
        this.req = req;
    }
    
    bindImageURL(news){
        if (news) {
            let bindedImage = {...news};
            if (news["ImageGUID"] != ""){
                bindedImage["ImageURL"] = "http://" + this.req.headers["host"] + ImageFilesRepository.getImageFileURL(news["ImageGUID"]);
            } else {
                bindedImage["ImageURL"] = "http://" + this.req.headers["host"] + ImageFilesRepository.getImageFileURL("No_image");
            }
            return bindedImage;
        }
        return null;
    }

    bindImageURLS(newsArray){
        let bindedImages = [];
        for(let news of newsArray) {
            bindedImages.push(this.bindImageURL(news));
        };
        return bindedImages;
    }

    get(id) {
        return this.bindImageURL(super.get(id));
    }

    getAll(params) {
        let news = super.getAll();
        if (news == null) return [];

        if (params != null) {

            let keys = (Object.keys(params));

            while (keys.length > 0) {
                let key = keys.pop();
                if (key == "author") {
                    news = this.findUserId(params.author, news);
                } else if (key == "keywords") {
                    news = this.findKeywords(params.keywords, news);
                }
            }

            news.sort((a, b) => b.Created - a.Created);

            let min = parseInt(params.min);
            let max = parseInt(params.max);

            news = news.slice(min, max);
        }

        return this.bindImageURLS(news);
    }

    findUserId(userId, news) {
        let elements = news.filter(n => n.UserId == userId);
        return elements;
    }

    findKeywords(keywords, news) {
        let words = keywords.split(' ');
        let elements = news.filter(news => this.containsAny(news, words));
        return elements ? elements : [];
    }

    containsAny(news, words){
        for(var i in words){
            var word = words[i].toLowerCase().trim();
            if (word.length != 0) {
                var regex = new RegExp('\\b' + word + '\\b');
                if (news.Title.toLowerCase().search(regex) > -1 || news.Text.toLowerCase().search(regex) > -1) {
                    return true;
                }
            }
        }
        return false;
    }

    add(news) {
        news["Created"] = utilities.nowInSeconds();
        if (News.valid(news)) {
            news["ImageGUID"] = ImageFilesRepository.storeImageData("", news["ImageData"]);
            delete news["ImageData"];
            return this.bindImageURL(super.add(news));
        }
        return null;
    }

    update(news) {
        news["Created"] = 0;
        if (News.valid(news)) {
            let foundNews = super.get(news.Id);
            if (foundNews != null) {
                news["Created"] = foundNews["Created"];
                news["ImageGUID"] = ImageFilesRepository.storeImageData(news["ImageGUID"], news["ImageData"]);
                delete news["ImageData"];
                
                return super.update(news);
            }
        }
        return false;
    }

    remove(id){
        let foundNews = super.get(id);
        if (foundNews) {
            ImageFilesRepository.removeImageFile(foundNews["ImageGUID"]);
            return super.remove(id);
        }
        return false;
    }
}