module Resque
  module Failure
    # A Failure backend that stores exceptions in Redis. Very simple but
    # works out of the box, along with support in the Resque web app.
    class Redis < Base
      def save
        data = {
          :failed_at => Time.now.to_i,
          :payload   => payload,
          :exception => exception.class.to_s,
          :error     => exception.to_s,
          :backtrace => Array(exception.backtrace),
          :worker    => worker.to_s,
          :queue     => queue
        }
        data = Resque.encode(data)
        Resque.redis.rpush(:failed, data)
      end

      def self.count
        Resque.redis.llen(:failed).to_i
      end

      def self.all(start = 0, count = 1)
        Resque.list_range(:failed, start, count)
      end

      def self.all_with_original_item(start = 0, count = 1)
        Resque.list_range_with_original_item(:failed, start, count)
      end

      def self.clear
        Resque.redis.del(:failed)
      end

      def self.requeue(index)
        item = all(index)
        item['retried_at'] = Time.now.to_i
        Resque.redis.lset(:failed, index, Resque.encode(item))
        Job.create(item['queue'], item['payload']['class'], *item['payload']['args'])
      end

      def self.delete(index)
        item = Resque.redis.lindex(:failed, index)
        Resque.redis.lrem(:failed, 1, item)
      end

      # these methods are safer to use when indexes are changing (which happens a lot at soocial.com)
      def self.delete_item(item)
        x = Resque.redis.lrem(:failed, 1, item)
      end

      # NB this will remove the job from the failed queue.
      def self.requeue_item(item)
        decoded = Resque::decode(item)
        decoded['retried_at'] = Time.now.to_i
        Job.create(decoded['queue'], decoded['payload']['class'], *decoded['payload']['args'])
        delete_item(item)
      end

    end
  end
end
