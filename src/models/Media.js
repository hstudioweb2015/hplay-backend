export default class Media {
	constructor(id, name, description, price, shareId, tags = []) {
		this.id = id;
		this.name = name;
		this.description = description;
		this.price = price;
		this.shareId = shareId;
		this.tags = tags;
	}
}