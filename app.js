const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const Product = require('./models/product')
const Farm = require('./models/farm')
const methodOverride = require('method-override')
const AppError = require('./Apperror')

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

app.set('views', path.join(__dirname + '/views'))
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

const categories = mongoose.model('Product').schema.obj.category.enum

function catchAsync(fn) {
	return function (req, res, next) {
		fn(req, res, next).catch((err) => next(err))
	}
}

app.get('/', (req, res) => res.redirect('/farms'))

//FARMS ROUTES

app.get(
	'/farms',
	catchAsync(async (req, res) => {
		const foundFarms = await Farm.find({})
		res.render('farms/farms', { farms: foundFarms })
	})
)

app.get('/farms/new', (req, res) => {
	res.render('farms/new', { categories })
})

app.post(
	'/farms',
	catchAsync(async (req, res) => {
		const { name, city, email } = req.body
		const newFarm = new Farm({ name, city, email })
		await newFarm.save()
		res.redirect('/farms')
	})
)

app.get(
	'/farms/:id',
	catchAsync(async (req, res, next) => {
		const { id } = req.params
		const foundFarm = await Farm.findById(id)
			.populate('products')
			.catch(() => next(new AppError('Not found', 404)))
		// console.log('foundFarm',foundFarm);
		res.render('farms/details', { farm: foundFarm })
	})
)

app.get(
	'/farms/:id/edit',
	catchAsync(async (req, res, next) => {
		const { id } = req.params
		const foundFarm = await Farm.findById(id).catch(() =>
			next(new AppError('Not found', 404))
		)
		res.render('farms/edit', { farm: foundFarm })
	})
)

app.put(
	'/farms/:id',
	catchAsync(async (req, res) => {
		const { id } = req.params
		const foundFarms = await Farm.findByIdAndUpdate(id, req.body, {
			runValidators: true,
			useFindAndModify: false,
			new: true
		})
		res.redirect(303, `/farms/${foundFarms._id}`)
	})
)

app.delete(
	'/farms/:id',
	catchAsync(async (req, res) => {
		const { id } = req.params
		await Farm.findByIdAndDelete(id)
		res.redirect('/farms')
	})
)

app.get('/farms/:id/products/new', (req, res) => {
	const { id } = req.params
	res.render('products/new', { categories, id })
})

app.post(
	'/farms/:id/products',
	catchAsync(async (req, res) => {
		const { id } = req.params
		const farm = await Farm.findById(id)

		const { name, price, category } = req.body
		const newProduct = new Product({ name, price, category })

		newProduct.farm = farm
		farm.products.push(newProduct)

		await newProduct.save()
		await farm.save()
		res.redirect(`/farms/${id}`)
	})
)

//PRODUCTS ROUTES
app.get(
	'/products',
	catchAsync(async (req, res) => {
		let { category } = req.query
		if (category) {
			const foundProducts = await Product.find({ category: category })
			category = category.charAt(0).toUpperCase() + category.slice(1)
			res.render('products/products', { products: foundProducts, category })
		} else {
			const foundProducts = await Product.find({})
			res.render('products/products', {
				products: foundProducts,
				category: 'All'
			})
		}
	})
)

app.post(
	'/products',
	catchAsync(async (req, res) => {
		const newProduct = new Product(req.body)
		await newProduct.save()
		res.redirect('/products')
	})
)

app.get(
	'/products/:id',
	catchAsync(async (req, res, next) => {
		const { id } = req.params
		const foundProduct = await Product.findById(id).populate('farm')
		res.render('products/details', { product: foundProduct })
	})
)

app.delete(
	'/products/:id',
	catchAsync(async (req, res, next) => {
		const { id } = req.params
		await Product.findByIdAndDelete(id)
		res.redirect('/products')
	})
)

app.get(
	'/products/:id/edit',
	catchAsync(async (req, res, next) => {
		const { id } = req.params
		const foundProduct = await Product.findById(id).catch(() =>
			next(new AppError('Not found', 404))
		)
		res.render('products/edit', { product: foundProduct, categories })
	})
)

app.put(
	'/products/:id',
	catchAsync(async (req, res, next) => {
		const { id } = req.params
		const foundProduct = await Product.findByIdAndUpdate(id, req.body, {
			runValidators: true,
			useFindAndModify: false,
			new: true
		})
		res.redirect(303, `/products/${foundProduct._id}`)
	})
)

app.get('*', (req, res, next) => next(new AppError('Not found', 404)))

app.use((err, req, res, next) => {
	const { status = 500, message = 'Something went wrong' } = err
	console.log(err)
	res.status(status).render('error', { message, status })
})

app.listen('3000', () => {
	console.log('Server is running on port 3000')
})
