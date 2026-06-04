#pragma once
#include <folly/Format.h>
#include <folly/dynamic.h>

namespace facebook {
namespace react {

inline folly::dynamic toString(llvh::StringRef stringRef) {
  return folly::dynamic(stringRef.str());
}

inline folly::dynamic toString(std::string string) {
  return folly::dynamic(string);
}

} // namespace react
} // namespace facebook
