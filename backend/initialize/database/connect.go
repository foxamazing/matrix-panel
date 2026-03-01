package database

import (
	"log"
	"matrix-panel/lib/cmn"
	"matrix-panel/models"
	"os"
	"path"
	"time"

	"github.com/glebarez/sqlite"
	"gorm.io/driver/mysql"
	_ "gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"gorm.io/gorm/schema"
)

const (
	MYSQL  = "mysql"
	SQLITE = "sqlite"
)

type DbClient interface {
	Connect() (db *gorm.DB, err error)
}

type MySQLConfig struct {
	Username    string
	Password    string
	Host        string
	Port        string
	Database    string
	WaitTimeout int
}

type SQLiteConfig struct {
	Filename string
}

func DbInit(dbClient DbClient) (db *gorm.DB, dbErr error) {
	db, dbErr = dbClient.Connect()
	if dbErr != nil {
		return
	}
	return
}

func (d *MySQLConfig) Connect() (db *gorm.DB, err error) {
	dsn := d.Username + ":" + d.Password + "@tcp(" + d.Host + ":" + d.Port + ")/" + d.Database + "?charset=utf8mb4&parseTime=True&loc=Local"
	db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: GetLogger(),
		NamingStrategy: schema.NamingStrategy{
			SingularTable: true,
		},
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	sqlDb, _ := db.DB()
	sqlDb.SetMaxIdleConns(10)
	sqlDb.SetMaxOpenConns(100)
	wait_timeout := d.WaitTimeout
	sqlDb.SetConnMaxLifetime(time.Duration(wait_timeout * int(time.Second)))
	return
}

func (d *SQLiteConfig) Connect() (db *gorm.DB, err error) {
	filePath := d.Filename
	exists := false
	if exists, err = cmn.PathExists(path.Dir(filePath)); err != nil {
		return
	} else {
		if !exists {
			if err = os.MkdirAll(path.Dir(filePath), 0700); err != nil {
				return
			}
		}
		db, err = gorm.Open(sqlite.Open(filePath), &gorm.Config{
			Logger: GetLogger(),
			NamingStrategy: schema.NamingStrategy{
				SingularTable: true,
			},
		})
	}
	return
}

func GetLogger() logger.Interface {
	return logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags),
		logger.Config{
			SlowThreshold:             time.Second,
			LogLevel:                  logger.Warn,
			IgnoreRecordNotFoundError: true,
			Colorful:                  true,
		},
	)
}

func CreateDatabase(driver string, db *gorm.DB) error {
	if driver == MYSQL {
		db = db.Set("gorm:table_options", "ENGINE=InnoDB")
	}
	err := db.AutoMigrate(
		&models.User{},
		&models.SystemSetting{},
		&models.ItemIcon{},
		&models.UserConfig{},
		&models.File{},
		&models.ItemIconGroup{},
		&models.ModuleConfig{},
	)
	return err
}

func NotFoundAndCreateUser(db *gorm.DB) error {
	fUser := models.User{}
	if err := db.First(&fUser).Error; err != nil {
		if err != gorm.ErrRecordNotFound {
			return err
		}
	}
	username := "admin"
	fUser.Mail = username + "@sun.cc"
	fUser.Username = username
	fUser.Name = username
	fUser.Status = 1
	fUser.Role = 1
	fUser.Password = cmn.PasswordEncryption("admin")
	if errCreate := db.Create(&fUser).Error; errCreate != nil {
		return errCreate
	}
	return nil
}
