public class MailService
{
	public string? Host { get; set; }
	public int Port { get; set; }
	public bool IsUseSsl { get; set; }

	public string? AuthLogin { get; set; }
	public string? AuthPassword { get; set; }

	public string? FromAddress { get; set; }
	public string? FromName { get; set; }
	public string? ToAddress { get; set; }

	public string? Subject { get; set; }
	public string? MessageText { get; set; }


	public bool SendEMail()
	{
		try {
			using (var smtp = new SmtpClient())
			{
				smtp.Connect(this.Host, this.Port, this.IsUseSsl);
				smtp.Authenticate(this.AuthLogin, this.AuthPassword);

				var body = new BodyBuilder();
				body.TextBody = this.MessageText;

				var msg = new MimeMessage()
				{
					Subject = this.Subject,
					Body = body.ToMessageBody(),
				};

				msg.To.Add(MailboxAddress.Parse(this.ToAddress));
				msg.From.Add(new MailboxAddress(this.FromName, this.FromAddress));

				smtp.Send(msg);
				smtp.Disconnect(true);
			}
			return true;
		}
		catch (Exception ex) {
			Console.WriteLine(ex.ToString());
			return false;
		}
	}
}