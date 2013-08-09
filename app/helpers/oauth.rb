def request_token
  callback_url = "http://vimsnake.com/oauth/callback"
  consumer = OAuth::Consumer.new(ENV['TWITTER_CONSUMER_KEY'],ENV['TWITTER_CONSUMER_SECRET'], :site => "https://api.twitter.com")
  @request_token = consumer.get_request_token(:oauth_callback => callback_url)
end

def current_user
  @current_user ||= User.find_by_id(session[:user_id])
end
