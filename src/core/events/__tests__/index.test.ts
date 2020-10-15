import { EventFactory } from '..'
import { User } from '../../user'

describe('Event Factory', () => {
  let user: User
  let factory: EventFactory

  const shoes = { product: 'shoes', total: '$35' }
  const shopper = { totalSpent: 100 }

  beforeEach(() => {
    user = new User()
    user.reset()
    factory = new EventFactory(user)
  })

  describe('group', () => {
    test('creates group events', () => {
      const group = factory.group('userId', { coolkids: true })

      expect(group.traits).toEqual({ coolkids: true })
      expect(group.type).toEqual('group')
      expect(group.event).toBeUndefined()
    })

    it('accepts traits', () => {
      const group = factory.group('netto', shopper)
      expect(group.traits).toEqual(shopper)
    })

    it('sets the groupId to the message', () => {
      const group = factory.group('coolKidsId', { coolkids: true })
      expect(group.groupId).toEqual('coolKidsId')
    })
  })

  describe('page', () => {
    test('creates page events', () => {
      const page = factory.page('category', 'name')
      expect(page.traits).toBeUndefined()
      expect(page.type).toEqual('page')
      expect(page.event).toBeUndefined()
      expect(page.name).toEqual('name')
      expect(page.category).toEqual('category')
    })

    it('accepts properties', () => {
      const page = factory.page('category', 'name', shoes)
      expect(page.properties).toEqual(shoes)
    })

    it('ignores category and page if not passed in', () => {
      const page = factory.page(null, null)
      expect(page.category).toBeUndefined()
      expect(page.name).toBeUndefined()
    })
  })

  describe('identify', () => {
    test('creates identify events', () => {
      const identify = factory.identify('Netto', shopper)
      expect(identify.traits).toEqual(shopper)
      expect(identify.properties).toBeUndefined()
      expect(identify.type).toEqual('identify')
      expect(identify.event).toBeUndefined()
    })
  })

  describe('track', () => {
    test('creates track events', () => {
      const track = factory.track('Order Completed', shoes)
      expect(track.event).toEqual('Order Completed')
      expect(track.properties).toEqual(shoes)
      expect(track.traits).toBeUndefined()
      expect(track.type).toEqual('track')
    })

    test('adds a message id', () => {
      const track = factory.track('Order Completed', shoes)
      expect(track.messageId).toContain('ajs-next')
    })

    test('sets an user id', () => {
      user.identify('007')

      const track = factory.track('Order Completed', shoes)
      expect(track.userId).toEqual('007')
    })

    test('sets an anonymous id', () => {
      const track = factory.track('Order Completed', shoes)
      expect(track.userId).toBeUndefined()
      expect(track.anonymousId).toEqual(user.anonymousId())
    })

    test('sets options in the context', () => {
      const track = factory.track('Order Completed', shoes, {
        opt1: true,
      })
      expect(track.context).toEqual({ opt1: true })
    })

    test('sets integrations', () => {
      const track = factory.track(
        'Order Completed',
        shoes,
        {},
        {
          amplitude: false,
        }
      )

      expect(track.integrations).toEqual({ amplitude: false })
    })

    test('merges integrations from `options` and `integrations`', () => {
      const track = factory.track(
        'Order Completed',
        shoes,
        {
          opt1: true,
          integrations: {
            amplitude: false,
          },
        },
        {
          googleAnalytics: true,
          amplitude: true,
        }
      )

      expect(track.integrations).toEqual({
        googleAnalytics: true,
        amplitude: false,
      })
    })

    test('should move foreign options into `context`', () => {
      const track = factory.track('Order Completed', shoes, {
        opt1: true,
        opt2: '🥝',
        integrations: {
          amplitude: false,
        },
      })

      expect(track.context).toEqual({ opt1: true, opt2: '🥝' })
    })

    test('should not move known options into `context`', () => {
      const track = factory.track('Order Completed', shoes, {
        opt1: true,
        opt2: '🥝',
        integrations: {
          amplitude: false,
        },
        anonymousId: 'anon-1',
        timestamp: new Date(),
      })

      expect(track.context).toEqual({ opt1: true, opt2: '🥝' })
    })

    test('accepts an anonymous id', () => {
      const track = factory.track('Order Completed', shoes, {
        anonymousId: 'anon-1',
      })

      expect(track.context).toEqual({})
      expect(track.anonymousId).toEqual('anon-1')
    })

    test('accepts a timestamp', () => {
      const timestamp = new Date()
      const track = factory.track('Order Completed', shoes, {
        timestamp,
      })

      expect(track.context).toEqual({})
      expect(track.timestamp).toEqual(timestamp)
    })

    test('accepts traits', () => {
      const track = factory.track('Order Completed', shoes, {
        traits: {
          cell: '📱',
        },
      })

      expect(track.context?.traits).toEqual({
        cell: '📱',
      })
    })

    test('accepts a context object', () => {
      const track = factory.track('Order Completed', shoes, {
        context: {
          library: {
            name: 'ajs-next',
            version: '0.1.0',
          },
        },
      })

      expect(track.context).toEqual({
        library: {
          name: 'ajs-next',
          version: '0.1.0',
        },
      })
    })

    test('merges a context object', () => {
      const track = factory.track('Order Completed', shoes, {
        foreignProp: '🇧🇷',
        context: {
          innerProp: '👻',
          library: {
            name: 'ajs-next',
            version: '0.1.0',
          },
        },
      })

      expect(track.context).toEqual({
        library: {
          name: 'ajs-next',
          version: '0.1.0',
        },
        foreignProp: '🇧🇷',
        innerProp: '👻',
      })
    })
  })
})