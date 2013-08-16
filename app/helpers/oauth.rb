def request_token

  if Sinatra::Application.environment == :development
    callback_url = "http://localhost:9393/oauth/callback"
  else
    callback_url = "http://vimsnake.com/oauth/callback"
  end
  consumer = OAuth::Consumer.new(ENV['TWITTER_CONSUMER_KEY'],ENV['TWITTER_CONSUMER_SECRET'], :site => "https://api.twitter.com")
  @request_token = consumer.get_request_token(:oauth_callback => callback_url)
end

def current_user
  @current_user ||= User.find_by_id(session[:user_id])
end
