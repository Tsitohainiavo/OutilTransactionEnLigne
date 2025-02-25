namespace OutilTransactionEnLigne.Server.Models
{
    public class Session
    {
        public int ID { get; set; }
        public int USER_ID { get; set; }
        public string TOKEN { get; set; }
        public DateTime CREATED_AT { get; set; }
        public DateTime EXPIRED_AT { get; set; }
    }
}
