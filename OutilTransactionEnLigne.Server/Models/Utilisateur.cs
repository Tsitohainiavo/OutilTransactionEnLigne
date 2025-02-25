﻿namespace OutilTransactionEnLigne.Server.Models
{
    public class Utilisateur
    {
        public int Id { get; set; }
        public string Nom { get; set; }
        public string Prenom { get; set; }
        public string Adresse { get; set; }
        public string TypeUtilisateur { get; set; }
        public string Email { get; set; }
        public string Telephone { get; set; }
        public DateTime DateCreation { get; set; }
        public string Password { get; set; }

    }
}
