---
title: "Testing Laravel • Lucid Projects - Mocking Lucid Units"
date: 2021-10-26T18:31:59Z
draft: true
image: "images/hologram.svg"
type: "featured"
description: "Testing Laravel Lucid projects - mocking units"
---

With the introduction of the new `mock()` method in Lucid v1.0.7 ([docs here](https://docs.lucidarch.dev/testing/)),
it became much simpler to simulate complex logic in tests,
in fact, it feels like we have a set of knobs that can be turned around to simulate different expectations in our tests.

Let's get our hands dirty!

Our test will be for a feature where we're placing an order and need to inform the shipment company we integrate with about this new order
they need to pick up and ship. Within our test, we certainly won't hit their APIs so we'll just simulate the different responses we might
receive from them, especially error ones which we need to handle differently.

## Step 1: Install Laravel & Lucid


Laravel
> At the time of this writing, Laravel was at version 8.

```bash
composer create-project laravel/laravel petshop
```

Lucid
```bash
composer require lucidarch/lucid
```

## Step 2: Feature Draft

I usually like to start by generating the feature that i'll be working on, and add comments to its `handle` as guidance, as we do with a todo list.

```bash
lucid make:feature PlaceOrder
```

This will generate two files: `app/Features/PlaceOrderFeature.php` and its test file at `tests/Feature/PlaceOrderFeatureTest.php`

Let's start filling it with the steps we need:

```php
class PlaceOrderFeature extends Feature
{
    public function handle(Request $request)
    {
        // 1. validate order request: items not empty

        // 2. retrieve items from DB

        // 3. validate items in stock

        // 4. create order

        // 5. contact shipment service for dispatch

        // 6. respond with status
    }
}
```

## Step 3: Validate Order Request

We will use FormRequest to validate the incoming payload.

Generate OrderRequest

```bash
lucid make:request PlaceOrderRequest Order
```

This will generate `app/Domains/Order/PlaceOrderRequest.php` in which we'll fill the `rules()` method to return our validation rules
and update `authorize()` to use `Auth` in verifying the user's presence:

```php
<?php

namespace App\Domains\Order\Requests;

use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Http\FormRequest;

class PlaceOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return Auth::check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'items' => 'required|array',
            'address.primary' => 'required',
            'address.secondary' => 'required',
            'address.country' => 'required',
            'address.city' => 'required',
            'address.postcode' => 'required',
        ];
    }
}

```

> For the sake of this example's brevity we'll only take the input above to process our order.

Now we just update the `Request` class in our feature's `handle()` to the new one and validation
will automatically happen every time we serve our feature:

```php
public function handle(PlaceOrderRequest $request)
```

## Step 4: Retrieve Items

We'll create a job that's responsible for retrieving Item objects when given an array of IDs,
but before we do that, we'll need to have our model and DB ready:

Generate `Item` model

```bash
lucid make:model Item
```

This will generate `app/Data/Models/Item.php` so let's fill its props and creats a migration for its table:

```php
class Item extends Model
{
    protected $fillable = ['name', 'description', 'quantity', 'price'];
}
```

```bash
php artisan make:migration create_items_table
```

And our schema is as such

```php
public function up()
{
    Schema::create('items', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->text('description');
        $table->bigInteger('quantity');
        $table->float('price');
        $table->timestamps();
    });
}
```

Now we create the job that'll do the work, we'll place it in the `Item` domain.

```bash
lucid make:job GetAvailableItems Item
```

This will generate `app/Domains/Item/Jobs/GetAvailableItemsJob.php` which we will fill with our query to get the items in stock by ID.

First, we'll have to add a scope for that specification in `app/Data/Models/Item.php` as a [query scope](https://laravel.com/docs/8.x/eloquent#local-scopes) `scopeInStock($query)`
```php
public function scopeInStock($query)
{
    return $query->where('quantity', '>', 0);
}
```

Now we query it in our job, in addition to checking whether items in the scope match the ones from input,
otherwise we'll have to flag to the user that not all items are in stock anymore.
We will do that by throwing an exception if the retrieved items don't match the input, which then gets handled by
the exception handler as desired.

```php
<?php

namespace App\Domains\Item\Jobs;

use App\Data\Item;
use Lucid\Units\Job;
use Illuminate\Database\Eloquent\Collection;
use App\Exceptions\NotAllItemsInStockException;

class GetAvailableItemsJob extends Job
{
    private array $ids;

    public function __construct(array $ids)
    {
        $this->ids = $ids;
    }

    public function handle(): Collection
    {
        $items = Item::inStock()->whereIn('id', $this->ids)->get();

        if ($items->count() === count($this->ids))  {
            return $items;
        }

        throw new NotAllItemsInStockException();
    }
}

```

And we need to create our exception class at `app/Exceptions/NotAllItemsInStockException.php`

```php
namespace App\Exceptions;

use Exception;

class NotAllItemsInStockException extends Exception
{
}
```

Of course this is not a real-world example since we're not taking the quantity chosen by the user into consideration for brevity reasons,
we're just selling one of each item chosen.

Now back to our feature, we should run that job where we're sure that the items we get are all in stock and can proceed with the order,
this job will remove two of the steps we drafted out at the beginning n.2 and 3. So it looks like this:

```php
class PlaceOrderFeature extends Feature
{
    public function handle(PlaceOrderRequest $request)
    {
        $items = $this->run(GetAvailableItemsJob::class, [
            'ids' => $request->input('items')
        ]);

        // 4. create order

        // 5. contact shipment service for dispatch

        // 6. respond with status
    }
}
```

## Step  4: Create Order

Now that we have our items and the address is available, we'll just need to create our order record to then be passed for shipment.
We'll start by creating the Order model and its table, as well as a pivot table for `item_order` to hold the link between both.

> The naming convention of `item_order` table is based on [Laravel's specification](https://laravel.com/docs/8.x/eloquent-relationships#many-to-many-table-structure)
to be in singular form, alphabetically ordered.

```bash
lucid make:model Order
```

This will generate `app/Data/Models/Order.php`:

```php
class Order extends Model
{
    protected $fillable = ['address_primary', 'address_secondary', 'address_country', 'address_city', 'address_postcode'];

    public function items()
    {
        return $this->belongsToMany(Item::class);
    }
}
```

Now for the migrations:

```bash
php artisan make:migration create_orders_table
```

```php
public function up()
{
    Schema::create('orders', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('user_id');
        $table->string('address_primary');
        $table->string('address_secondary');
        $table->string('address_country');
        $table->string('address_city');
        $table->string('address_postcode');
        $table->timestamps();

        $table->foreign('user_id')->references('id')->on('users');
    });
}
```

And our pivot `item_order` table:

```bash
php artisan make:migration create_item_order_table
```

```php
public function up()
{
    Schema::create('item_order', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('order_id');
        $table->unsignedBigInteger('item_id');
        $table->timestamps();

        $table->foreign('order_id')->references('id')->on('orders');
        $table->foreign('item_id')->references('id')->on('items');
    });
}
```

Now we're ready to insert an order record, so we'll create a job that does that:

```bash
lucid make:job CreateOrder order
```

This will generate `app/Domains/Order/Jobs/CreateOrderJob.php` which will require our `$items` and `address` from input.

```php
<?php

namespace App\Domains\Order\Jobs;

use App\Data\Order;
use Lucid\Units\Job;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Collection;

class CreateOrderJob extends Job
{
    private array $address;
    private Collection $items;

    public function __construct(Collection $items, array $address)
    {
        $this->items = $items;
        $this->address = $address;
    }

    public function handle()
    {
        // decrease the quantity while still in stock and place order
        DB::transaction(function() {
            $this->items->each(function($item) {
                $item->inStock()->decrement('quantity');
            });

            $order = Order::create([
                'user_id' => Auth::id(),
                'address_primary' => $this->address['primary'],
                'address_secondary' => $this->address['secondary'],
                'address_country' => $this->address['country'],
                'address_city' => $this->address['city'],
                'address_postcode' => $this->address['postcode'],
            ]);

            $order->attach($this->items->pluck('id'));
        });
    }
}
```

## Step 5: Shipment

Let's ship our order!

We assume that we have a third-party shipment service that we need to notify about our order so they ship it.
This is the part that we'll mock in our tests the most since it's external to our application and we need to ensure it's handled properly.

```bash
lucid make:job ShipOrder Shipment
```

This will generate `app/Domains/Shipment/Jobs/ShipOrderJob.php`. We don't really care about how to ship for now we'll just accept the `$order`
in the constructor. `handle` will have whatever code to call the shipment service's API but since we'll be mocking there will be no need for any code here:

```php
class ShipOrderJob extends Job
{
    private Order $order;

    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    public function handle()
    {
        //
    }
}
```

And last is to respond with a json once all is good. We'll add it with the shipment job call in our feature:

```php
public function handle(PlaceOrderRequest $request)
{
    $items = $this->run(GetAvailableItemsJob::class, [
        'ids' => $request->input('items'),
    ]);

    $order = $this->run(CreateOrderJob::class, [
        'items' => $items,
        'address' => $request->input('address'),
    ]);

    $notified = $this->run(ShipOrderJob::class, compact('order'));

    return $this->run(new RespondWithJsonJob(
        [
            'placed' => isset($order) && $notified,
        ]
    ));
}
```

## Step 7: Wiring

We still got some wiring work to do before we can move to our tests, we need a route and a controller to serve our feature.

Generate a controller for our orders
```php
lucid make:controller order
```

This will create `app/Controllers/OrderController.php`, then add a `create` method to it to serve our feature:

```php
public function create()
{
    return $this->serve(PlaceOrderFeature::class);
}
```

In `routes/web.php`
```php
use App\Http\Controllers\OrderController;

Route::post('/orders', [OrderController::class, 'create']);
```

## Step 6: Testing

Let's test what we just wrote and see how we can simulate some cases.
A test file has already been generated for our feature at `tests/Feature/PlaceOrderFeatureTest.php` so we'll fill it up now;

**Item Factory**

Throughout our test we'll need to generate `Item` instances so we'll need a factory for it.

```bash
php artisan make:factory ItemFactory
```

```php
<?php

namespace Database\Factories;

use App\Data\Item;
use Illuminate\Database\Eloquent\Factories\Factory;

class ItemFactory extends Factory
{
    protected $model = Item::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'name' => $this->faker->name(),
            'description' => $this->faker->sentence(),
            'quantity' => $this->faker->numberBetween(1, 4),
            'price' => $this->faker->numberBetween(10, 100),
        ];
    }
}
```

And in the `Item` model class add the `HasFactory` trait and tell Laravel which Factory we should use, so it'll look like this eventually:

```php
<?php

namespace App\Data;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Item extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description', 'quantity', 'price'];

    protected static function newFactory()
    {
        return app(ItemFactory::class);
    }

    public function scopeInStock($query, $quantity)
    {
        return $query->where('quantity', '>=', $quantity);
    }
}
```

**Database Setup**

We need a database for our tests, and it's best to use SQLite in memory for an ephemeral data store. For that, let's update our `phpunit.xml`
by uncommenting the two lines:

```xml
<server name="DB_CONNECTION" value="sqlite"/>
<server name="DB_DATABASE" value=":memory:"/>
```

### Acceptance Test

Our first test is to make sure that what we just wrote works:

```php
<?php

namespace Tests\Feature;

use App\Data\Item;
use Tests\TestCase;
use App\Models\User;
use App\Features\PlaceOrderFeature;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PlaceOrderFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_place_order_feature()
    {
        $user = User::factory()->create();
        $items = Item::factory()->count(5)->create();

        $response = $this->actingAs($user)->postJson('/orders', [
            'items' => $items->pluck('id'),
            'address' => [
                'primary' => 'Somewhere we all live',
                'secondary' => 'take a left, then a right, apt. 007',
                'country' => 'Lebanon',
                'city' => 'Beirut',
                'postcode' => '00961',
            ]
        ]);

        $response->assertJson(['placed' => true]);
    }
}
```

Pretty simple stuff, we create a user and a bunch of items then place our order.
The test will pass because `ShipOrderJob` just returns `true` but if we had actual code there it won't be as such, so let's mock!

The purpose of our next test is to see how our application will handle failures at the shipment provider.
For that to be simulated we'll need to mock our way to a fake order so that we can control the flow:

```php
public function test_place_order_shipment_error()
{
    $user = User::factory()->create();
    $order = Order::factory()->hasItems(3)->create();

    $items = $order->items()->get();

    $payload = [
        'items' => $items->pluck('id')->toArray(),
        'address' => [
            'primary' => 'Somewhere we all live',
            'secondary' => 'take a left, then a right, apt. 007',
            'country' => 'Lebanon',
            'city' => 'Beirut',
            'postcode' => '00961',
        ]
    ];

    GetAvailableItemsJob::mock(['ids' => $payload['items']])->shouldReturn($items);

    CreateOrderJob::mock(['items' => $items, 'address' => $payload['address']])
        ->shouldReturn($order);

    ShipOrderJob::mock(['order' => $order])
        ->shouldThrow(ShipmentProviderNotAvailableException::class);

    $this->expectException(ShipmentProviderNotAvailableException::class);

    $response = $this->actingAs($user)->postJson('/orders', $payload);
}
```

This represents a
