const mongoose = require('mongoose')
const Product = require('./models/product')
const Farm = require('./models/farm')
const { Schema } = mongoose
const ObjectId = mongoose.Types.ObjectId

mongoose
	.connect('mongodb://localhost:27017/farmStock', {
		useNewUrlParser: true,
		useUnifiedTopology: true
	})
	.then(() => {
		console.log('Contection opened!')
	})
	.catch((err) => {
		console.log(err)
	})

const seedFarms = [
	{
		name: 'Rainbow Hill Farm',
		city: 'Olkfast',
		email: 'rainbowhill@gmail.com',
		products: []
	},
	{
		name: 'Waterfall Acres',
		city: 'Vrodon',
		email: 'waterfall@gmail.com',
		products: []
	},
	{
		name: 'Broken Cart Gardens',
		city: 'Yluford',
		email: 'rainbowhill@gmail.com',
		products: []
	}
]

const seedProducts = [
	{
		name: 'Eggplant🍆',
		price: 6.90,
		category: 'vegetable'
	},
	{
		name: 'Very Spooky Purple potato',
		price: 1.59,
		category: 'vegetable'
	},
	{
		name: 'Basic Organic Goddess Melon',
		price: 2.13,
		category: 'fruit'
	},
	{
		name: 'Verry Yummy Organic Mini Seedless Watermelon',
		price: 3.99,
		category: 'fruit'
	},
	{
		name: 'Chocolate Whole Milk From Brown Cow',
		price: 2.68,
		category: 'dairy'
	},
	{
		name: 'Really Good Cheese',
		price: 4.20,
		category: 'dairy'
	}
]

const farmsId = []
const seedDB = async () => {
	await Farm.deleteMany({})
	await Product.deleteMany({})
	await Farm.insertMany(seedFarms)
	.then(async (farms) => {
		await farms.forEach((farm) => {
			farmsId.push(farm._id)
		})
		console.log('Farms created')
	})
	.then(async () => {
		await Product.insertMany(seedProducts)
		.then((products) => {
			products.forEach(async (product) => {
				const farmId = farmsId[Math.floor(Math.random() * farmsId.length)]
				product.farm = farmId
				await product.save()
				await Farm.findByIdAndUpdate(
					farmId,
					{
						$push: {
							products: product._id
						}
					},
					{
						runValidators: true,
						useFindAndModify: false,
						new: true
					}
				).then(() => {
					console.log('Product added to farm')
				})
			})
			console.log('Products created')
		})
	})
	.catch((err) => {
		console.log(err)
	})
}
seedDB()
