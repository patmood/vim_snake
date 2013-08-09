class User < ActiveRecord::Base
  def twitter_client
    @twitter_client ||= Twitter::Client.new(:oauth_token => self.token,
                                            :oauth_token_secret => self.secret)
  end
end
