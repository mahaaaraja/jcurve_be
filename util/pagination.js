const sequelize = require('../util/dbConnection');

exports.paginateResults = async (req, countQuery, countReplacements, dataQuery, dataReplacements) => {
	try {
		let {page, limit} = req.query;
		page = parseInt(page);
		limit = parseInt(limit);

		let totalRecords = 0, totalPages = 0;

		let paginatedResults = {};

		if(page) {
			limit = limit || 10;
			const offset = (page - 1) * limit;
			dataQuery += `
			 LIMIT :limit OFFSET :offset;
			`;
			dataReplacements.limit = limit;
			dataReplacements.offset = offset;

			totalRecords = await sequelize.query(countQuery, {
				type: sequelize.QueryTypes.SELECT,
				replacements: countReplacements,
			});

			totalRecords = parseInt(totalRecords?.[0]?.totalRecords) || 0;
			totalPages = Math.ceil(totalRecords / limit);
			paginatedResults = {totalRecords, totalPages, currentPage: page, limit};
		}

		const data = await sequelize.query(dataQuery, {
			type: sequelize.QueryTypes.SELECT,
			replacements: dataReplacements,
		});

		paginatedResults.data = data;

		return paginatedResults;
	} catch (error) {
		console.error(error);
		throw new Error('Error while paginating data: ', error);
	}
};