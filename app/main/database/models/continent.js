import Sequelize, { Model } from 'sequelize';


class Continent extends Model {
  static autoinit( sequelize ) {
    return super.init({
      code: { type: Sequelize.STRING, unique: true },
      name: { type: Sequelize.STRING, unique: true },
    }, { sequelize, modelName: 'Continent' });
  }

  static associate( models ) {
    this.hasMany( models.Country );
    this.belongsToMany( models.Compdef, { through: 'CompdefContinents' });
  }
}

export default Continent;
