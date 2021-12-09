const UsersRepository = require('../models/usersRepository');
const NewsRepository = require('../models/newsRepository');
const ImagesRepository = require('../models/imagesRepository');
const News = require('../models/news');

module.exports =
    class NewsController extends require('./Controller') {
        constructor(req, res, params) {
            super(req, res, params, false /* needAuthorization */);
            this.newsRepository = new NewsRepository(this.req);
        }

        head() {
            console.log("News ETag request:", this.newsRepository.ETag);
            this.response.ETag(this.newsRepository.ETag);
        }

        // GET: api/news
        // GET: api/news?sort=key&key=value....
        // GET: api/news/{id}
        get(id) {
            if (this.params) {
                if (Object.keys(this.params).length > 0) {
                    let news = this.newsRepository.getAll(this.params)
                    news = this.AssignAuthorInfos(news);

                    this.response.JSON(news, this.newsRepository.ETag);
                } else {
                    this.queryStringHelp();
                }
            }
            else {
                if (!isNaN(id)) {
                    let news = this.newsRepository.get(id);
                    news = this.AssignAuthorInfos(news);
                    this.response.JSON(news[0]);
                }
                else {
                    let news = this.newsRepository.getAll();
                    news = this.AssignAuthorInfos(news);
                    this.response.JSON(news, this.newsRepository.ETag);
                }
            }
        }

        post(news) {
            if (this.requestActionAuthorized()) {
                if (News.valid(news)) {
                    let newNews = this.newsRepository.add(news);
                    if (newNews)
                        this.response.created(newNews);
                    else
                        this.response.internalError();
                } else
                    this.response.unprocessable();
            } else
                this.response.unAuthorized();
        }

        put(news) {
            if (this.requestActionAuthorized()) {
                if (News.valid(news)) {
                    if (this.newsRepository.update(news))
                        this.response.ok();
                    else
                        this.response.notFound();
                } else
                    this.response.unprocessable();
            } else
                this.response.unAuthorized();
        }

        remove(id) {
            if (this.requestActionAuthorized()) {
                if (this.newsRepository.remove(id))
                    this.response.accepted();
                else
                    this.response.notFound();
            } else
                this.response.unAuthorized();
        }

        AssignAuthorInfos(newsArray) {
            if (!Array.isArray(newsArray))
                newsArray = [newsArray];

            let usersRepository = new UsersRepository(this.req, true);
            let users = usersRepository.getAll();
            let host = "http://" + this.req["headers"].host; //<--- À VOIR SI ÇA FONCTIONNE AVEC GLITCH??

            newsArray.forEach(n => {
                let user = users.find(user => user.Id == n.UserId);
                if (user != undefined) {
                    n["AuthorName"] = user.Name;
                    n["AuthorAvatarURL"] = host + "/images/" + user.AvatarGUID + ".png";
                } else {
                    n["AuthorName"] = "Inconnu"
                    n["AuthorAvatarURL"] = "./images/No_Avatar.png";
                }
            });

            return newsArray;
        }
    }