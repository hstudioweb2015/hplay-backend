export default class Media {
	/**
	 * @constructor
	 * @description Media model
	 * @param id {Integer} - Media id
	 * @param name {String} - Media name
	 * @param description {String} - Media description
	 * @param price {Number} - Media price (in cents)
	 * @param shareId {String} - Media share id
	 * @param tags {Array} - Media tags
	 */
	constructor(id, name, description, price, shareId, tags = []) {
		this.id = id;
		this.name = name;
		this.description = description;
		this.price = price;
		this.shareId = shareId;
		this.tags = tags;
	}
}