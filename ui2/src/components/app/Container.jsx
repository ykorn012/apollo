import React, { useState } from 'react';
import { Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';
import { parse, parseUrl } from 'query-string';
import './Container.css';

export const Container = ({ title, component: Component, match, location, ...props }) => {
  const breadcrumbHomePath = [{ path: '/home', title: 'Home' }];
  const [breadcrumbs, setBreadcrumbs] = useState(breadcrumbHomePath);

  //   const handleBreadcrumbs = (path, title) => {
  //     let prevBreadcrumbs = null;
  //     const [url, searchUrl] = path.split('?');
  //     const currentBreadcrumb = url.split('/').pop();
  //     const currentBreadcrumbPath = `${match.url}/${currentBreadcrumb}`;
  // debugger
  //     if (searchUrl) {
  //       const searchParams = searchUrl.split('&');
  //       const searchTitles = searchParams.map(searchParam => searchParam.split('=')[0]);
  //
  //       prevBreadcrumbs = searchTitles.map((searchTitle, index) => ({
  //         path: searchParams[index - 1]
  //           ? `${match.url}/${searchTitle}?${searchParams[index - 1]}`
  //           : `${match.url}/${searchTitle}`,
  //         title: searchTitle,
  //       }));
  //       prevBreadcrumbs.map(prevBreadcrumb => {
  //         breadcrumbs.map(breadcrumb => {
  //           if (breadcrumb.path === prevBreadcrumb.path) {
  //             prevBreadcrumbs = null;
  //           }
  //         });
  //       });
  //     }
  //
  //     const breadcrumbInd = breadcrumbs.findIndex(({ path }) => path === currentBreadcrumbPath);
  //     if (~breadcrumbInd) {
  //       setBreadcrumbs(breadcrumbs.slice(0, breadcrumbInd + 1));
  //     } else {
  //       prevBreadcrumbs
  //         ? setBreadcrumbs([...breadcrumbs, ...prevBreadcrumbs, { path: `${match.url}/${currentBreadcrumb}`, title }])
  //         : setBreadcrumbs([...breadcrumbs, { path: `${match.url}/${currentBreadcrumb}`, title }]);
  //     }
  //   };

  // const handleBreadcrumbs = (path, title) => {
  //   const { url, query } = parseUrl(path);
  //   const currentBreadcrumbPath = url.split('/').pop();
  //   const breadcrumbInd = breadcrumbs.findIndex(({ path }) => path === `${match.url}/${currentBreadcrumbPath}`);
  //   debugger;
  //   let prevBreadcrumbs = [];
  //   let addPrevBreadcrumbs = true;
  //   if (query) {
  //     for (let queryKey in query) {
  //       prevBreadcrumbs.push({
  //         path: query[index - 1]
  //           ? `${match.url}/${queryKey}?${query[index - 1]}`
  //           : `${match.url}/${queryKey}`,
  //         title: queryKey,
  //       });
  //     }
  //     debugger;
  //   }
  // };

  const handleBreadcrumbs = (path, title) => {
    const pathSearch = path.split('?')[1];
    const currentBreadcrumb = path.split('/').pop();
    const breadcrumbInd = breadcrumbs.findIndex(breadcrumb => breadcrumb.path === `${match.url}/${currentBreadcrumb}`);
    let prevBreadcrumbs;
    let addPrevBreadcrumbs = true;
    if (pathSearch) {
      const searchParams = pathSearch.split('&');
      const searchTitles = searchParams.map(searchParam => searchParam.split('=')[0]);
      prevBreadcrumbs = searchTitles.map((searchTitle, index) => ({
        path: searchParams[index - 1]
          ? `${match.url}/${searchTitle}?${searchParams[index - 1]}`
          : `${match.url}/${searchTitle}`,
        title: searchTitle,
      }));
      prevBreadcrumbs.map(prevBreadcrumb => {
        return breadcrumbs.map(breadcrumb => {
          if (breadcrumb.path === prevBreadcrumb.path) {
            addPrevBreadcrumbs = false;
          }
        });
      });
    }
    if (breadcrumbInd >= 0) {
      setBreadcrumbs(breadcrumbs.slice(0, breadcrumbInd + 1));
    } else {
      addPrevBreadcrumbs && prevBreadcrumbs
        ? setBreadcrumbs([...breadcrumbs, ...prevBreadcrumbs, { path: `${match.url}/${currentBreadcrumb}`, title }])
        : setBreadcrumbs([...breadcrumbs, { path: `${match.url}/${currentBreadcrumb}`, title }]);
    }
  };
  const resetBreadcrumbs = () => {
    setBreadcrumbs(breadcrumbHomePath);
  };

  return (
    <div className="container">
      <div className="container-title large-title">{title}</div>
      <div className="container-breadcrumbs">
        <Breadcrumb>
          {breadcrumbs.map(({ path, title }, index) => (
            <Breadcrumb.Item key={index} className="container-breadcrumb">
              <Link to={path}>{title}</Link>
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
      </div>
      <div className="container-content">
        <Component
          handleBreadcrumbs={handleBreadcrumbs}
          resetBreadcrumbs={resetBreadcrumbs}
          match={match}
          location={location}
          {...props}
        />
      </div>
    </div>
  );
};
