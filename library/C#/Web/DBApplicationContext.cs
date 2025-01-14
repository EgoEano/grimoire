public class DBApplicationContext<T> : DbContext where T : class
{
	public DBApplicationContext(string connectionString)
		: base(BuildSqliteContextOptions(connectionString))
	{
	}

	private static DbContextOptions<DBApplicationContext<T>> BuildSqlServerContextOptions(string connectionString)
	{
		return new DbContextOptionsBuilder<DBApplicationContext<T>>()
		.UseSqlServer(connectionString)
		.Options;
	}

	private static DbContextOptions<DBApplicationContext<T>> BuildSqliteContextOptions(string connectionString)
	{
		return new DbContextOptionsBuilder<DBApplicationContext<T>>()
		.UseSqlite(connectionString)
		.Options;
	}

	public DbSet<T> DbSet { get; set; }


	public int Add(T model)
	{
		DbSet.Add(model);
		return SaveChanges();
	}

	public List<T>? GetAll()
	{
		return DbSet.ToList();
	}

	public T? GetById(int Id)
	{
		return DbSet.Find(Id);
	}

	public List<T>? SearchBy(List<(string key, string operand, object value)> conditions)
	{
		if (conditions == null || conditions.Count == 0)
		{
			return null;
		}

		ParameterExpression parameter = Expression.Parameter(typeof(T), "entity");
		BinaryExpression? combinedExpression = null;

		foreach (var condition in conditions)
		{
			if (condition.key == null || condition.value == null || condition.operand == null)
			{
				continue;
			}

			MemberExpression property = Expression.Property(parameter, condition.key);
			ConstantExpression value = Expression.Constant(condition.value);

			BinaryExpression? equality = null;
			switch (condition.operand)
			{
				case ("=="):
					equality = Expression.Equal(property, value);
					break;
				case ("!="):
					equality = Expression.NotEqual(property, value);
					break;
				case (">"):
					equality = Expression.GreaterThan(property, value);
					break;
				case ("<"):
					equality = Expression.LessThan(property, value);
					break;
				case (">="):
					equality = Expression.GreaterThanOrEqual(property, value);
					break;
				case ("<="):
					equality = Expression.LessThanOrEqual(property, value);
					break;
				default:
					continue;
			}

			combinedExpression = (combinedExpression == null) ? equality : Expression.AndAlso(combinedExpression, equality);
		}

		if (combinedExpression != null)
		{
			Expression<Func<T, bool>> predicate = Expression.Lambda<Func<T, bool>>(combinedExpression, parameter);
			return DbSet.Where(predicate).ToList();
		}
		else
		{
			return null;
		}
	}

	public int Update(T model)
	{
		Entry(model).State = EntityState.Modified;
		return SaveChanges();
	}

	public int Delete(int Id)
	{
		var model = GetById(Id);
		if (model != null)
		{
			DbSet.Remove(model);
			return SaveChanges();
		}
		return 0;
	}

	public List<T>? ExecuteProcedure(string nameProcedure, object[]? parameters = null)  // Not ready method
	{
		Database.ExecuteSqlRaw(nameProcedure, parameters);
		return null;
	}
	
	public bool DropDB()
	{
		return Database.EnsureDeleted();
	}
}
