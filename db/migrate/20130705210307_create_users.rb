class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.string :handle
      t.string :token
      t.string :secret
      t.integer :topscore
    end
  end
end
