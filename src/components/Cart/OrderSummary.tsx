
"use client";

import { selectTotalPrice } from "@/redux/features/cart-slice";
import { useAppSelector } from "@/redux/store";
import React from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const OrderSummary = () => {
  const cartItems = useAppSelector((state) => state.cartReducer.items);
  const totalPrice = useSelector(selectTotalPrice);
  const router = useRouter();

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    const invalidItem = cartItems.find(
      (item) => !item.productVariantId
    );

    if (invalidItem) {
      toast.error(
        `Please select a valid variant for ${invalidItem.title}`
      );
      return;
    }

    router.push("/checkout");
  };

  return (
    <div className="lg:max-w-[455px] w-full">
      <div className="bg-white shadow-1 rounded-[10px]">
        <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
          <h3 className="font-medium text-xl text-dark">
            Order Summary
          </h3>
        </div>

        <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
          <div className="flex items-center justify-between py-5 border-b border-gray-3">
            <div>
              <h4 className="font-medium text-dark">Product</h4>
            </div>
            <div>
              <h4 className="font-medium text-dark text-right">
                Subtotal
              </h4>
            </div>
          </div>

          {cartItems.map((item, key) => (
            <div
              key={key}
              className="flex items-center justify-between py-5 border-b border-gray-3"
            >
              <div>
                <p className="text-dark">{item.title}</p>
              </div>
              <div>
                <p className="text-dark text-right">
                  ${item.discountedPrice * item.quantity}
                </p>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between pt-5">
            <div>
              <p className="font-medium text-lg text-dark">Total</p>
            </div>
            <div>
              <p className="font-medium text-lg text-dark text-right">
                ${totalPrice}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCheckout}
            disabled={cartItems.length === 0}
            className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Process to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
