const mongoose = require('mongoose')
const Farm = require('./farm')
const { Schema } = mongoose
const productSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	price: {
		type: Number,
		required: true,
		min: 0
	},
	category: {
		type: String,
		required: true,
		enum: ['fruit', 'vegetable', 'dairy'],
		lowercase: true
	},
	farm: {
		type: Schema.Types.ObjectId,
		ref: 'Farm'
	}
})

productSchema.post('findOneAndDelete', async function (product) {
	const foundFarm = await Farm.findByIdAndUpdate(
		product.farm,
		{ $pull: { products: product._id } },
		{
			runValidators: true,
			useFindAndModify: false,
			new: true
		}
	)
})

const Product = mongoose.model('Product', productSchema)

module.exports = Product
