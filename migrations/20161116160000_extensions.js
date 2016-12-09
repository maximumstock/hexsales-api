
exports.up = function(knex, Promise) {

	return Promise.all([

		knex.schema.raw(`CREATE OR REPLACE FUNCTION _final_median(NUMERIC[])
	 			   RETURNS NUMERIC AS
	 			$$
	 			   SELECT AVG(val)
	 			   FROM (
	 			     SELECT val
	 			     FROM unnest($1) val
	 			     ORDER BY 1
	 			     LIMIT  2 - MOD(array_upper($1, 1), 2)
	 			     OFFSET CEIL(array_upper($1, 1) / 2.0) - 1
	 			   ) sub;
	 			$$
	 			LANGUAGE 'sql' IMMUTABLE;

				DROP AGGREGATE IF EXISTS median(NUMERIC);

	 			CREATE AGGREGATE median(NUMERIC) (
	 			  SFUNC=array_append,
	 			  STYPE=NUMERIC[],
	 			  FINALFUNC=_final_median,
	 			  INITCOND='{}'
	 			);
		`)

	]);

};

exports.down = function(knex, Promise) {

	return Promise.all([
		knex.schema.raw('DROP FUNCTION _final_median(NUMERIC[]) CASCADE;')
	]);

};
