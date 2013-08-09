class User < ActiveRecord::Base
  after_initialize :init

  def init
    self.topscore ||= 0
  end

  def twitter_client
    @twitter_client ||= Twitter::Client.new(:oauth_token => self.token,
                                            :oauth_token_secret => self.secret)
  end
end
