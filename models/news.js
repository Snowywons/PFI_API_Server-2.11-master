module.exports = 
class News{
    constructor(userId, title, imageGUID, text)
    {
        this.Id = 0;
        this.UserId = userId;
        this.Title = title !== undefined ? title : "";
        this.Text = text !== undefined ? text : "";
        this.Created = 0;
        this.ImageGUID = imageGUID !== undefined ? imageGUID : "";
    }

    static valid(instance) {
        console.log(instance);
        const Validator = new require('./validator');
        let validator = new Validator();
        validator.addField('Id','integer');
        validator.addField('UserId','integer');
        validator.addField('Title','string');
        validator.addField('Text','string');
        validator.addField('Created','integer');
        return validator.test(instance);
    }
}