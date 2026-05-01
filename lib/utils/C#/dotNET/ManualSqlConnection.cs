using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace PersonalWebApp.Models.Connection
{
    public class ManualSqlConnection
    {
        public string? ErrorMessage { get; set; }
        public string? InfoMessage { get; set; }


        public List<T> ExecuteProcedure<T>(string procedureName) where T : new()
        {
            return ExecuteManualProcedure<T>(procedureName, this);
        }

        public static List<T> ExecuteManualProcedure<T>(string procedureName, object obj) where T : new()
        {
            var connectionString = GetConnectionString();
            List<SQLProcedureData> procedureInputParameters = CheckInputParameters(procedureName);
            var inputObjectProperties = typeof(T).GetProperties();
            List<T> list = new();
            if (!procedureInputParameters.Any())
            {
                Console.WriteLine("Вызов процедуры не вернул параметры.");
                return list;
            }

            using SqlConnection connection = new(connectionString);

            connection.InfoMessage += ConnectionInfoMessage;

            //Using string for direct query (not safe because of sql-injection, but useful in specific)
            //string query = "exec dbo." + procedureName + " ";

            //for (int i = 0; i < procedureInputParameters.Count; i++)
            //{
            //    query += procedureInputParameters[i].ParameterNameSQL;
            //    if (i < procedureInputParameters.Count - 1) { query += ", "; }
            //}
            //using SqlCommand command = new(query, connection);

            using SqlCommand command = new(procedureName, connection);
            command.CommandType = System.Data.CommandType.StoredProcedure;

            foreach (var item in procedureInputParameters)
            {
                try
                {
                    object? value = inputObjectProperties.First(p => p.Name == item.ParameterName)?.GetValue(obj);
                    if (value != null)
                    {
                        command.Parameters.Add(new SqlParameter(item.ParameterNameSQL, value));
                    }
                    else
                    {
                        command.Parameters.Add(new SqlParameter(item.ParameterNameSQL, DBNull.Value));
                    }
                }
                catch
                {
                    command.Parameters.Add(new SqlParameter(item.ParameterNameSQL, DBNull.Value));
                }
            }

            try
            {
                if (connection.State != System.Data.ConnectionState.Open) { connection.Open(); }
                using SqlDataReader reader = command.ExecuteReader();

                while (reader.Read())
                {
                    T objIteration = new();
                    foreach (var item in inputObjectProperties)
                    {
                        try
                        {
                            object? readParameterValue = reader[item.Name];
                            if (readParameterValue != null)
                            {
                                item.SetValue(objIteration, readParameterValue);
                            }
                        }
                        catch
                        {
                        }
                    }

                    list.Add(objIteration);
                }
                reader.Close();
                return list;
            }
            catch (SqlException ex)
            {
                Console.WriteLine(ex.ToString());
                return list;
            }
            finally
            {
                connection.Close();
            }
        }

        public static List<SQLProcedureData> CheckInputParameters(string procedureName)
        {
            List<SQLProcedureData> procedureInputDataList = new();
            var connectionString = GetConnectionString();

            using SqlConnection connection = new(connectionString);
            string query = "SELECT name AS [Parameter Name], type_name(user_type_id) AS [Data Type] FROM sys.parameters WHERE object_id = OBJECT_ID(N'" + procedureName + "')";
            using SqlCommand command = new(query, connection);

            try
            {
                if (connection.State != System.Data.ConnectionState.Open) { connection.Open(); }
                using SqlDataReader reader = command.ExecuteReader();

                while (reader.Read())
                {
                    SQLProcedureData procedureData = new();
                    string param = (string)reader["Parameter Name"];
                    string type = (string)reader["Data Type"];
                    procedureData.Set(procedureName, param, type);
                    procedureInputDataList.Add(procedureData);
                }
                reader.Close();
                return procedureInputDataList;
            }
            catch (SqlException ex)
            {
                Console.WriteLine(ex.ToString());
                return procedureInputDataList;
            }
            finally
            {
                connection.Close();
            }
        }

        public static string GetConnectionString(string ConnectionString = "HomeDBConnection")
        {
            ConfigurationBuilder builder = new();
            builder.SetBasePath(Directory.GetCurrentDirectory()).AddJsonFile("appsettings.json");
            string connectionString = builder.Build().GetConnectionString(ConnectionString) ?? String.Empty;

            return connectionString;
        }

        private static void ConnectionInfoMessage(object sender, SqlInfoMessageEventArgs e)
        {
            foreach (SqlError error in e.Errors)
            {
                Console.WriteLine("SQL Server Message: " + error.Message);
            }
        }
    }

    public class SQLProcedureData
    {
        public string? ProcedureName { get; set; }
        public string? ParameterName { get; set; }
        public string? ParameterNameSQL { get; set; }
        public string? ParameterType { get; set; }
        public string? ParameterTypeSQL { get; set; }


        public void Set(string procedureName, string parameterNameSQL, string parameterTypeSQL)
        {
            ProcedureName = procedureName;
            ParameterNameSQL = parameterNameSQL;
            ParameterTypeSQL = parameterTypeSQL;
            ParameterName = parameterNameSQL.Replace("@", "");
        }
    }
}
